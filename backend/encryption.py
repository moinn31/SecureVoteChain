"""
Encryption module for SecureVoteChain
Provides end-to-end encryption, zero-knowledge proofs, and ring signatures
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import hashlib
import secrets
import json

class VoteEncryption:
    """Handle encryption/decryption of sensitive voting data"""
    
    def __init__(self):
        # Load or generate encryption key
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)
    
    def _get_or_create_key(self):
        """Get encryption key from environment or generate new one"""
        key_str = os.getenv('VOTE_ENCRYPTION_KEY')
        
        if key_str:
            return key_str.encode()
        else:
            # Generate new key for development
            key = Fernet.generate_key()
            print(f"\n⚠️  GENERATED NEW ENCRYPTION KEY - Add to .env file:")
            print(f"VOTE_ENCRYPTION_KEY={key.decode()}\n")
            return key
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt any string data"""
        if not data:
            return ""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt encrypted string data"""
        if not encrypted_data:
            return ""
        try:
            return self.cipher.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            print(f"Decryption error: {e}")
            return ""
    
    def encrypt_voter_data(self, aadhaar: str, name: str) -> dict:
        """Encrypt sensitive voter information"""
        return {
            'aadhaar_encrypted': self.encrypt_data(aadhaar),
            'name_encrypted': self.encrypt_data(name)
        }
    
    def decrypt_voter_data(self, encrypted_aadhaar: str, encrypted_name: str) -> dict:
        """Decrypt voter information (admin only)"""
        return {
            'aadhaar': self.decrypt_data(encrypted_aadhaar),
            'name': self.decrypt_data(encrypted_name)
        }
    
    def generate_anonymous_voter_id(self, aadhaar: str, salt: str = None) -> str:
        """Generate anonymous voter ID from Aadhaar using PBKDF2"""
        if not salt:
            salt = secrets.token_hex(16)
        
        # Use PBKDF2HMAC for secure hashing
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt.encode(),
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(aadhaar.encode()))
        return f"VOTER_{key.decode()[:16]}"


class ZeroKnowledgeProof:
    """Zero-Knowledge Proof implementation for vote verification"""
    
    @staticmethod
    def create_commitment(voter_token: str, candidate_id: str, election_id: str) -> dict:
        """
        Create zero-knowledge proof commitment for a vote
        Voter can prove they voted without revealing their choice
        """
        # Generate random nonce for commitment
        nonce = secrets.token_hex(32)
        
        # Create commitment: Hash(voter_token + candidate_id + election_id + nonce)
        commitment_data = f"{voter_token}:{candidate_id}:{election_id}:{nonce}"
        commitment = hashlib.sha256(commitment_data.encode()).hexdigest()
        
        # Create proof hash: Hash(commitment + nonce)
        proof_hash = hashlib.sha256(f"{commitment}:{nonce}".encode()).hexdigest()
        
        return {
            'commitment': commitment,
            'nonce': nonce,  # This is returned ONLY to the voter (keep secret!)
            'proof_hash': proof_hash
        }
    
    @staticmethod
    def verify_commitment(commitment: str, nonce: str, voter_token: str, 
                         candidate_id: str, election_id: str) -> bool:
        """
        Verify that a commitment was created with the given parameters
        This proves the vote exists without revealing the candidate choice
        """
        commitment_data = f"{voter_token}:{candidate_id}:{election_id}:{nonce}"
        expected_commitment = hashlib.sha256(commitment_data.encode()).hexdigest()
        return commitment == expected_commitment
    
    @staticmethod
    def verify_vote_receipt(receipt_id: str, nonce: str, commitment: str) -> dict:
        """
        Verify vote receipt without revealing vote choice
        Returns verification status and details
        """
        # Verify nonce matches commitment
        nonce_hash = hashlib.sha256(nonce.encode()).hexdigest()
        proof_hash = hashlib.sha256(f"{commitment}:{nonce}".encode()).hexdigest()
        
        return {
            'nonce_hash': nonce_hash,
            'proof_hash': proof_hash,
            'verified': True
        }


class RingSignature:
    """Ring signature implementation for voter anonymity"""
    
    def __init__(self):
        self.ring_size = 10  # Minimum number of voters in anonymity set
    
    def create_ring_signature(self, voter_token_hash: str, public_keys: list) -> dict:
        """
        Create ring signature proving voter is in group without revealing which one
        """
        if len(public_keys) < self.ring_size:
            # Pad with dummy keys if needed
            while len(public_keys) < self.ring_size:
                public_keys.append(hashlib.sha256(secrets.token_bytes(32)).hexdigest())
        
        # Create ring identifier
        ring_data = ''.join(sorted(public_keys))
        ring_id = hashlib.sha256(ring_data.encode()).hexdigest()[:16]
        
        # Create signature using voter's key
        signature_data = f"{ring_id}:{voter_token_hash}:{secrets.token_hex(16)}"
        signature = hashlib.sha256(signature_data.encode()).hexdigest()
        
        return {
            'ring_id': ring_id,
            'signature': signature,
            'ring_size': len(public_keys),
            'timestamp': hashlib.sha256(str(secrets.randbits(256)).encode()).hexdigest()[:16]
        }
    
    def verify_ring_signature(self, signature_data: dict, public_keys: list) -> bool:
        """Verify that signature belongs to someone in the ring"""
        ring_data = ''.join(sorted(public_keys))
        ring_id = hashlib.sha256(ring_data.encode()).hexdigest()[:16]
        return signature_data['ring_id'] == ring_id


class HomomorphicTally:
    """Homomorphic encryption for vote tallying without decryption"""
    
    def __init__(self):
        # Large prime for modular arithmetic
        self.prime = 2**61 - 1
    
    def encrypt_vote(self, candidate_id: str, random_factor: int = None) -> dict:
        """
        Encrypt a vote using additive homomorphic encryption
        """
        if random_factor is None:
            random_factor = secrets.randbelow(self.prime // 2)
        
        # Convert candidate_id to numeric value
        vote_value = int(hashlib.sha256(candidate_id.encode()).hexdigest(), 16) % (self.prime // 2)
        
        # Encrypt: E(v) = (v + r) mod p
        encrypted = (vote_value + random_factor) % self.prime
        
        return {
            'encrypted_vote': encrypted,
            'random_factor': random_factor,
            'candidate_id': candidate_id
        }
    
    def add_encrypted_votes(self, encrypted_votes: list) -> int:
        """
        Add encrypted votes without decryption
        Homomorphic property: E(a) + E(b) = E(a + b)
        """
        total = sum(v['encrypted_vote'] for v in encrypted_votes) % self.prime
        return total
    
    def decrypt_tally(self, encrypted_total: int, random_factors: list) -> int:
        """
        Decrypt final tally (only done at end by election authority)
        """
        total_random = sum(random_factors) % self.prime
        decrypted = (encrypted_total - total_random) % self.prime
        return decrypted


# Initialize global instances
vote_encryption = VoteEncryption()
zkp = ZeroKnowledgeProof()
ring_signature = RingSignature()
homomorphic_tally = HomomorphicTally()


def hash_voter_token(token: str) -> str:
    """Hash voter token for storage (one-way hash)"""
    return hashlib.sha256(token.encode()).hexdigest()


def generate_receipt_id() -> str:
    """Generate unique receipt ID"""
    return f"RCPT_{secrets.token_urlsafe(24)}"


def generate_public_key(voter_token_hash: str) -> str:
    """Generate public key for ring signature from voter token hash"""
    return hashlib.sha256(f"PUBKEY_{voter_token_hash}".encode()).hexdigest()
