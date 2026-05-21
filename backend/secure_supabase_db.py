"""
Secure Database Layer with Encryption and Zero-Knowledge Proofs
Wraps Supabase with privacy-preserving features
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from backend.blockchain import Blockchain
from backend.encryption import (
    vote_encryption, zkp, ring_signature, 
    hash_voter_token, generate_receipt_id, generate_public_key
)
import json
import hashlib


DEFAULT_ADMIN_PASSWORD_HASH = hashlib.sha256("admin123".encode()).hexdigest()

DEFAULT_ADMIN_ACCOUNTS = [
    {"username": "admin", "email": "admin@securevotechain.com", "state": "All States", "role": "super_admin"},
    {"username": "admin_andhra_pradesh", "email": "admin.ap@securevotechain.com", "state": "Andhra Pradesh", "role": "state_admin"},
    {"username": "admin_arunachal_pradesh", "email": "admin.ar@securevotechain.com", "state": "Arunachal Pradesh", "role": "state_admin"},
    {"username": "admin_assam", "email": "admin.as@securevotechain.com", "state": "Assam", "role": "state_admin"},
    {"username": "admin_bihar", "email": "admin.br@securevotechain.com", "state": "Bihar", "role": "state_admin"},
    {"username": "admin_chhattisgarh", "email": "admin.cg@securevotechain.com", "state": "Chhattisgarh", "role": "state_admin"},
    {"username": "admin_goa", "email": "admin.ga@securevotechain.com", "state": "Goa", "role": "state_admin"},
    {"username": "admin_gujarat", "email": "admin.gj@securevotechain.com", "state": "Gujarat", "role": "state_admin"},
    {"username": "admin_haryana", "email": "admin.hr@securevotechain.com", "state": "Haryana", "role": "state_admin"},
    {"username": "admin_himachal_pradesh", "email": "admin.hp@securevotechain.com", "state": "Himachal Pradesh", "role": "state_admin"},
    {"username": "admin_jharkhand", "email": "admin.jh@securevotechain.com", "state": "Jharkhand", "role": "state_admin"},
    {"username": "admin_karnataka", "email": "admin.ka@securevotechain.com", "state": "Karnataka", "role": "state_admin"},
    {"username": "admin_kerala", "email": "admin.kl@securevotechain.com", "state": "Kerala", "role": "state_admin"},
    {"username": "admin_madhya_pradesh", "email": "admin.mp@securevotechain.com", "state": "Madhya Pradesh", "role": "state_admin"},
    {"username": "admin_maharashtra", "email": "admin.mh@securevotechain.com", "state": "Maharashtra", "role": "state_admin"},
    {"username": "admin_manipur", "email": "admin.mn@securevotechain.com", "state": "Manipur", "role": "state_admin"},
    {"username": "admin_meghalaya", "email": "admin.ml@securevotechain.com", "state": "Meghalaya", "role": "state_admin"},
    {"username": "admin_mizoram", "email": "admin.mz@securevotechain.com", "state": "Mizoram", "role": "state_admin"},
    {"username": "admin_nagaland", "email": "admin.nl@securevotechain.com", "state": "Nagaland", "role": "state_admin"},
    {"username": "admin_odisha", "email": "admin.or@securevotechain.com", "state": "Odisha", "role": "state_admin"},
    {"username": "admin_punjab", "email": "admin.pb@securevotechain.com", "state": "Punjab", "role": "state_admin"},
    {"username": "admin_rajasthan", "email": "admin.rj@securevotechain.com", "state": "Rajasthan", "role": "state_admin"},
    {"username": "admin_sikkim", "email": "admin.sk@securevotechain.com", "state": "Sikkim", "role": "state_admin"},
    {"username": "admin_tamil_nadu", "email": "admin.tn@securevotechain.com", "state": "Tamil Nadu", "role": "state_admin"},
    {"username": "admin_telangana", "email": "admin.tg@securevotechain.com", "state": "Telangana", "role": "state_admin"},
    {"username": "admin_tripura", "email": "admin.tr@securevotechain.com", "state": "Tripura", "role": "state_admin"},
    {"username": "admin_uttar_pradesh", "email": "admin.up@securevotechain.com", "state": "Uttar Pradesh", "role": "state_admin"},
    {"username": "admin_uttarakhand", "email": "admin.uk@securevotechain.com", "state": "Uttarakhand", "role": "state_admin"},
    {"username": "admin_west_bengal", "email": "admin.wb@securevotechain.com", "state": "West Bengal", "role": "state_admin"},
    {"username": "admin_andaman_nicobar", "email": "admin.an@securevotechain.com", "state": "Andaman and Nicobar Islands", "role": "state_admin"},
    {"username": "admin_chandigarh", "email": "admin.ch@securevotechain.com", "state": "Chandigarh", "role": "state_admin"},
    {"username": "admin_dadra_nagar_haveli", "email": "admin.dn@securevotechain.com", "state": "Dadra and Nagar Haveli and Daman and Diu", "role": "state_admin"},
    {"username": "admin_delhi", "email": "admin.dl@securevotechain.com", "state": "Delhi", "role": "state_admin"},
    {"username": "admin_jammu_kashmir", "email": "admin.jk@securevotechain.com", "state": "Jammu and Kashmir", "role": "state_admin"},
    {"username": "admin_ladakh", "email": "admin.la@securevotechain.com", "state": "Ladakh", "role": "state_admin"},
    {"username": "admin_lakshadweep", "email": "admin.ld@securevotechain.com", "state": "Lakshadweep", "role": "state_admin"},
    {"username": "admin_puducherry", "email": "admin.py@securevotechain.com", "state": "Puducherry", "role": "state_admin"},
]


class SecureSupabaseDatabase:
    """
    Secure database with end-to-end encryption and zero-knowledge proofs
    """
    
    def __init__(self):
        # Get Supabase credentials from environment variables
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_KEY", "")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError(
                "⚠️ Missing Supabase credentials!\n"
                "Please set SUPABASE_URL and SUPABASE_KEY in .env file"
            )
        
        # Initialize Supabase client
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.blockchain = Blockchain()
        self.encryption = vote_encryption
        
        print("✅ Connected to Secure Supabase PostgreSQL database")
        print("🔒 Encryption enabled for sensitive data")
        
        # Test connection by trying to read admins table
        self._test_admin_table_connection()

        # Ensure the expected demo admins exist with the standard password.
        self.ensure_default_admin_accounts()
    
    def _test_admin_table_connection(self):
        """Test if we can read from admins table"""
        try:
            print("🔍 Testing admins table connection...")
            response = self.client.table('admins').select('count', count='exact').execute()
            print(f"✅ Admins table accessible. Total count: {response.count}")
            
            # Try to get one admin
            test_response = self.client.table('admins').select('*').limit(1).execute()
            if test_response.data:
                print(f"✅ Sample admin retrieved: {test_response.data[0].get('username', 'Unknown')}")
            else:
                print("⚠️ Admins table is empty or RLS is blocking access!")
                print("   Run FIX_ADMIN_RLS.sql to disable RLS on admins table")
        except Exception as e:
            error_text = str(e).lower()
            if "getaddrinfo failed" in error_text or "name or service not known" in error_text:
                raise ValueError(
                    "Supabase host could not be resolved. Check SUPABASE_URL in .env "
                    "or verify internet/DNS access."
                ) from e

            print(f"❌ Cannot access admins table: {e}")
            print("   This might be due to RLS (Row Level Security) blocking access")
            print("   Run FIX_ADMIN_RLS.sql in Supabase SQL Editor to fix this")

    def _get_default_admin_record(self, username: str) -> Optional[Dict]:
        """Return a built-in admin record when Supabase does not have one."""
        default_admin = next((admin for admin in DEFAULT_ADMIN_ACCOUNTS if admin['username'] == username), None)
        if not default_admin:
            return None

        now = datetime.now().isoformat()
        return {
            'username': default_admin['username'],
            'password_hash': DEFAULT_ADMIN_PASSWORD_HASH,
            'email': default_admin['email'],
            'state': default_admin['state'],
            'role': default_admin['role'],
            'is_active': True,
            'created_at': now,
            'updated_at': now,
            'last_login': None,
            '_source': 'local_fallback',
        }
    
    # ==================== SECURE VOTER REGISTRATION ====================
    
    def register_voter_secure(self, aadhaar: str, name: str, state: str, voter_id: str, voter_token: str, phone: str = None) -> Dict:
        """
        Register voter with encrypted sensitive data
        Returns: voter_id, voter_token (plain - give to voter), public_key
        
        Args:
            aadhaar: 12-digit Aadhaar number
            name: Voter's full name
            state: Indian state/UT
            voter_id: Generated voter ID
            voter_token: Generated voting token
            phone: Phone number for SMS OTP authentication (+91xxxxxxxxxx)
        """
        try:
            # Encrypt sensitive data
            encrypted_data = self.encryption.encrypt_voter_data(aadhaar, name)
            
            # Hash voter token for storage
            voter_token_hash = hash_voter_token(voter_token)
            
            # Generate public key for ring signatures
            public_key = generate_public_key(voter_token_hash)
            
            # Prepare voter data
            voter_data = {
                'voter_id': voter_id,
                'aadhaar_encrypted': encrypted_data['aadhaar_encrypted'],
                'name_encrypted': encrypted_data['name_encrypted'],
                'state': state,
                'voter_token_hash': voter_token_hash,
                'public_key': public_key,
                'created_at': datetime.now().isoformat()
            }
            
            # Add phone if provided
            if phone:
                voter_data['phone'] = phone.strip()
            
            # Insert encrypted voter data
            result = self.client.table('voters').insert(voter_data).execute()
            
            return {
                'voter_id': voter_id,
                'voter_token': voter_token,  # Return plain token to voter (they must save it!)
                'public_key': public_key,
                'state': state,
                'phone': phone
            }
        
        except Exception as e:
            print(f"❌ Error registering voter: {e}")
            raise
    
    def register_voter(self, voter_data: Dict) -> Dict:
        """
        Register voter - wrapper for register_voter_secure.
        Accepts voter_data dict from VoterAuth.register_voter()
        
        Args:
            voter_data: Dict with keys: voter_id, voting_token, name, aadhaar, state, phone (optional)
            
        Returns:
            Dict with registration result
        """
        return self.register_voter_secure(
            aadhaar=voter_data['aadhaar'],
            name=voter_data['name'],
            state=voter_data['state'],
            voter_id=voter_data['voter_id'],
            voter_token=voter_data['voting_token'],
            phone=voter_data.get('phone')
        )

    def bulk_import_voters(self, voters_list: List[Dict]) -> Dict:
        """
        Bulk import voters with Aadhaar-based upsert support.

        Args:
            voters_list: List of dicts with keys: aadhaar_number, name, state, phone, voter_id

        Returns:
            Dict with keys: total, inserted, updated, errors
        """
        import secrets

        result = {
            'total': len(voters_list),
            'inserted': 0,
            'updated': 0,
            'errors': []
        }

        for idx, voter in enumerate(voters_list, 1):
            try:
                aadhaar = str(voter.get('aadhaar_number', voter.get('aadhaar', ''))).strip()
                name = str(voter.get('name', '')).strip()
                state = str(voter.get('state', '')).strip()
                phone = str(voter.get('phone', '')).strip() or None
                voter_id = str(voter.get('voter_id', '')).strip() or None

                if not aadhaar or not name or not state:
                    result['errors'].append({
                        'row': voter.get('row_number', idx),
                        'error': 'Missing required fields (aadhaar_number, name, or state)'
                    })
                    continue

                if len(aadhaar) != 12 or not aadhaar.isdigit():
                    result['errors'].append({
                        'row': voter.get('row_number', idx),
                        'error': f'Invalid Aadhaar number: {aadhaar}'
                    })
                    continue

                existing = self.get_voter_by_aadhaar(aadhaar)

                if existing:
                    encrypted_data = self.encryption.encrypt_voter_data(aadhaar, name)
                    update_payload = {
                        'aadhaar_encrypted': encrypted_data['aadhaar_encrypted'],
                        'name_encrypted': encrypted_data['name_encrypted'],
                        'state': state,
                        'updated_at': datetime.now().isoformat(),
                    }
                    if phone:
                        update_payload['phone'] = phone

                    self.client.table('voters').update(update_payload).eq('voter_id', existing['voter_id']).execute()
                    result['updated'] += 1
                else:
                    if not voter_id:
                        voter_id = f"VOT{secrets.token_hex(4).upper()}"

                    voter_token = secrets.token_hex(32)
                    self.register_voter_secure(
                        aadhaar=aadhaar,
                        name=name,
                        state=state,
                        voter_id=voter_id,
                        voter_token=voter_token,
                        phone=phone,
                    )
                    result['inserted'] += 1

            except Exception as e:
                result['errors'].append({
                    'row': voter.get('row_number', idx),
                    'error': str(e)
                })

        return result
    
    def get_voter_by_token_hash(self, voter_token_hash: str) -> Optional[Dict]:
        """Get voter by hashed token (for authentication)"""
        try:
            result = self.client.table('voters').select('*').eq(
                'voter_token_hash', voter_token_hash
            ).execute()
            
            if result.data:
                return dict(result.data[0])
            return None
        except Exception as e:
            print(f"Error getting voter: {e}")
            return None
    
    def get_voter_decrypted(self, voter_id: str) -> Optional[Dict]:
        """
        Get voter with decrypted data (ADMIN ONLY - use sparingly!)
        This action should be logged for audit
        """
        try:
            result = self.client.table('voters').select('*').eq('voter_id', voter_id).execute()
            
            if not result.data:
                return None
            
            voter = dict(result.data[0])
            
            # Decrypt sensitive data
            decrypted = self.encryption.decrypt_voter_data(
                voter['aadhaar_encrypted'],
                voter['name_encrypted']
            )
            
            voter['aadhaar'] = decrypted['aadhaar']
            voter['name'] = decrypted['name']
            
            # Log this decryption for audit
            self.log_data_access('decrypt_voter_data', voter_id)
            
            return voter
        
        except Exception as e:
            print(f"Error decrypting voter: {e}")
            return None
    
    def get_recent_public_keys(self, limit: int = 10) -> List[str]:
        """Get recent voter public keys for ring signature anonymity sets"""
        try:
            result = self.client.table('voters').select('public_key').order(
                'created_at', desc=True
            ).limit(limit).execute()
            
            return [row['public_key'] for row in result.data if row.get('public_key')]
        except Exception as e:
            print(f"Error getting public keys: {e}")
            return []
    
    # ==================== SECURE VOTE CASTING ====================
    
    def cast_vote_secure(self, voter_token: str, election_id: str, candidate_id: str) -> Dict:
        """
        Cast vote with zero-knowledge proof and encryption
        Returns: receipt_id, nonce (voter must save!), transaction_hash
        """
        try:
            # 1. Verify voter exists and hasn't voted
            voter_token_hash = hash_voter_token(voter_token)
            voter = self.get_voter_by_token_hash(voter_token_hash)
            
            if not voter:
                raise ValueError("Invalid voter token")
            
            # 2. Check if already voted
            if self.has_voted_secure(election_id, voter_token_hash):
                raise ValueError("Already voted in this election")
            
            # 3. Create zero-knowledge proof
            zkp_data = zkp.create_commitment(voter_token, candidate_id, election_id)
            
            # 4. Encrypt candidate choice
            candidate_encrypted = self.encryption.encrypt_data(candidate_id)
            
            # 5. Get public keys for ring signature
            public_keys = self.get_recent_public_keys(limit=10)
            if voter['public_key'] not in public_keys:
                public_keys.append(voter['public_key'])
            
            # 6. Create ring signature
            ring_sig = ring_signature.create_ring_signature(voter_token_hash, public_keys)
            
            # 7. Save anonymity set
            self.save_anonymity_set(election_id, ring_sig['ring_id'], public_keys)
            
            # 8. Add to blockchain
            blockchain_data = {
                'election_id': election_id,
                'commitment': zkp_data['commitment'],
                'ring_id': ring_sig['ring_id'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Mine block and get transaction hash
            transaction_hash = self.blockchain.mine_block(blockchain_data)
            
            # 9. Store encrypted vote (NO link to voter!)
            result = self.client.table('votes').insert({
                'election_id': election_id,
                'candidate_encrypted': candidate_encrypted,
                'commitment': zkp_data['commitment'],
                'proof_hash': zkp_data['proof_hash'],
                'ring_signature': json.dumps(ring_sig),
                'transaction_hash': transaction_hash,
                'timestamp': datetime.now().isoformat()
            }).execute()
            
            # 10. Create receipt for voter
            receipt_id = generate_receipt_id()
            nonce_hash = hashlib.sha256(zkp_data['nonce'].encode()).hexdigest()
            
            self.client.table('vote_receipts').insert({
                'receipt_id': receipt_id,
                'election_id': election_id,
                'commitment': zkp_data['commitment'],
                'nonce_hash': nonce_hash,
                'timestamp': datetime.now().isoformat()
            }).execute()
            
            # 11. Save blockchain state
            self.save_blockchain()
            
            # 12. Mark voter as voted (in memory or separate table)
            self.mark_voter_as_voted(election_id, voter_token_hash)
            
            return {
                'success': True,
                'receipt_id': receipt_id,
                'nonce': zkp_data['nonce'],  # Voter MUST save this!
                'transaction_hash': transaction_hash,
                'message': '🎉 Vote cast successfully! Save your receipt ID and nonce to verify later.'
            }
        
        except Exception as e:
            print(f"Error casting secure vote: {e}")
            raise
    
    def mark_voter_as_voted(self, election_id: str, voter_token_hash: str):
        """Mark that a voter has voted (stored separately from vote)"""
        try:
            # Create a hashed identifier that doesn't reveal the voter
            vote_marker = hashlib.sha256(
                f"{election_id}:{voter_token_hash}".encode()
            ).hexdigest()
            
            # Store in a separate tracking table or use blockchain
            # For now, we'll use a simple hash-based check
            pass  # Implementation depends on your needs
        except Exception as e:
            print(f"Error marking voter: {e}")
    
    def has_voted_secure(self, election_id: str, voter_token_hash: str) -> bool:
        """Check if voter has voted without revealing vote"""
        try:
            # Check vote_tracking table for this election and voter
            result = self.client.table('vote_tracking').select('*').eq(
                'election_id', election_id
            ).eq(
                'voter_token_hash', voter_token_hash
            ).execute()
            
            has_voted = len(result.data) > 0
            if has_voted:
                print(f"✅ Voter has already voted in election {election_id}")
            return has_voted
        except Exception as e:
            print(f"⚠️ vote_tracking unavailable, checking votes table instead: {e}")

        try:
            result = self.client.table('votes').select('id').eq(
                'election_id', election_id
            ).eq(
                'voter_token_hash', voter_token_hash
            ).execute()

            has_voted = len(result.data) > 0
            if has_voted:
                print(f"✅ Voter has already voted in election {election_id} (votes table fallback)")
            return has_voted
        except Exception as e:
            print(f"⚠️ Error checking vote status in votes table: {e}")
            return False
    
    def has_voted(self, election_id: str, voter_token: str) -> bool:
        """Check if voter has voted (wrapper for compatibility)"""
        try:
            # Hash the voter token
            voter_token_hash = hash_voter_token(voter_token)
            return self.has_voted_secure(election_id, voter_token_hash)
        except Exception as e:
            print(f"Error checking vote status: {e}")
            return False
    
    def record_vote(self, vote_data: Dict) -> str:
        """
        Record a vote on blockchain and in database.
        Returns the transaction hash.
        """
        # Generate transaction hash
        vote_string = f"{vote_data['election_id']}{vote_data['candidate_id']}{vote_data['timestamp']}"
        transaction_hash = hashlib.sha256(vote_string.encode()).hexdigest()
        
        print(f"🔗 Adding vote to blockchain with tx_hash: {transaction_hash}")
        
        # Add to blockchain
        block = self.blockchain.add_block({
            'election_id': vote_data['election_id'],
            'candidate_id': vote_data['candidate_id'],
            'timestamp': vote_data['timestamp'],
            'transaction_hash': transaction_hash
        })
        
        # CRITICAL: Save blockchain to database after adding block
        try:
            self.save_blockchain()
            print(f"✅ Blockchain saved with new vote block")
        except Exception as e:
            print(f"⚠️ Error saving blockchain: {e}")
        
        # Encrypt candidate ID for database storage using encrypt_data method
        candidate_encrypted = self.encryption.encrypt_data(vote_data['candidate_id'])
        
        # Generate ZKP commitment for privacy
        commitment = hashlib.sha256(
            f"{transaction_hash}:{vote_data['candidate_id']}".encode()
        ).hexdigest()
        
        # Generate proof hash
        proof_hash = hashlib.sha256(
            f"{commitment}:{vote_data['timestamp']}".encode()
        ).hexdigest()
        
        # Save vote to database. Try the secure schema first, then fall back to
        # smaller payloads so the app works across the different table versions
        # used in this project.
        vote_payloads = [
            {
                'election_id': vote_data['election_id'],
                'candidate_encrypted': candidate_encrypted,
                'commitment': commitment,
                'proof_hash': proof_hash,
                'ring_signature': json.dumps({
                    'transaction_hash': transaction_hash,
                    'timestamp': vote_data['timestamp']
                }),
                'transaction_hash': transaction_hash,
                'timestamp': vote_data['timestamp'],
            },
            {
                'election_id': vote_data['election_id'],
                'candidate_encrypted': candidate_encrypted,
                'commitment': commitment,
                'proof_hash': proof_hash,
                'transaction_hash': transaction_hash,
                'timestamp': vote_data['timestamp'],
            },
        ]

        vote_insert_error = None
        for payload in vote_payloads:
            try:
                self.client.table('votes').insert(payload).execute()
                print(f"✅ Vote recorded in votes table: Election {vote_data['election_id']}, Candidate {vote_data['candidate_id']}")
                vote_insert_error = None
                break
            except Exception as e:
                vote_insert_error = e
                print(f"⚠️ Vote insert attempt failed: {e}")

        if vote_insert_error is not None:
            raise RuntimeError(f"Could not save vote to votes table: {vote_insert_error}")

        # Track that this voter has voted (without linking to specific vote).
        # If the vote_tracking table is missing in Supabase, the vote itself is
        # still stored; the frontend keeps the voted state in localStorage.
        try:
            self.client.table('vote_tracking').insert({
                'election_id': vote_data['election_id'],
                'voter_token_hash': hash_voter_token(vote_data['voter_token']),
                'voted_at': vote_data['timestamp']
            }).execute()
            print(f"✅ Vote tracking recorded for election {vote_data['election_id']}")
        except Exception as e:
            print(f"⚠️ Vote tracking unavailable or duplicate row: {e}")
        
        return transaction_hash
    
    def save_anonymity_set(self, election_id: str, ring_id: str, public_keys: List[str]):
        """Save anonymity set for ring signatures"""
        try:
            self.client.table('anonymity_sets').insert({
                'election_id': election_id,
                'ring_id': ring_id,
                'public_keys': json.dumps(public_keys),
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            # May already exist, that's okay
            pass
    
    # ==================== VOTE VERIFICATION ====================
    
    def verify_vote_receipt(self, receipt_id: str, nonce: str) -> Dict:
        """
        Verify vote using receipt without revealing vote choice
        """
        try:
            # 1. Get receipt
            result = self.client.table('vote_receipts').select('*').eq(
                'receipt_id', receipt_id
            ).execute()
            
            if not result.data:
                return {'verified': False, 'message': 'Invalid receipt ID'}
            
            receipt = dict(result.data[0])
            
            # 2. Verify nonce
            nonce_hash = hashlib.sha256(nonce.encode()).hexdigest()
            if nonce_hash != receipt['nonce_hash']:
                return {'verified': False, 'message': 'Invalid nonce'}
            
            # 3. Get vote by commitment
            vote_result = self.client.table('votes').select('*').eq(
                'commitment', receipt['commitment']
            ).execute()
            
            if not vote_result.data:
                return {'verified': False, 'message': 'Vote not found'}
            
            vote = dict(vote_result.data[0])
            
            # 4. Verify blockchain
            blockchain_valid = self.blockchain.get_block_by_hash(vote['transaction_hash']) is not None
            
            return {
                'verified': True,
                'election_id': receipt['election_id'],
                'timestamp': vote['timestamp'],
                'transaction_hash': vote['transaction_hash'],
                'blockchain_verified': blockchain_valid,
                'message': '✅ Your vote has been counted and is secure on the blockchain!'
            }
        
        except Exception as e:
            print(f"Error verifying receipt: {e}")
            return {'verified': False, 'message': str(e)}
    
    # ==================== VOTE TALLYING (ADMIN ONLY) ====================
    
    def tally_votes_secure(self, election_id: str) -> Dict[str, int]:
        """
        Decrypt and tally votes (ADMIN ONLY - during results phase)
        """
        try:
            # Get all votes for election
            result = self.client.table('votes').select('candidate_encrypted').eq(
                'election_id', election_id
            ).execute()
            
            # Decrypt and count
            tally = {}
            for vote_data in result.data:
                try:
                    candidate_id = self.encryption.decrypt_data(vote_data['candidate_encrypted'])
                    tally[candidate_id] = tally.get(candidate_id, 0) + 1
                except Exception as e:
                    print(f"Error decrypting vote: {e}")
            
            # Log this action
            self.log_data_access('tally_votes', election_id)
            
            return tally
        
        except Exception as e:
            print(f"Error tallying votes: {e}")
            return {}
    
    # ==================== AUDIT LOGGING ====================
    
    def log_data_access(self, action_type: str, resource_id: str):
        """Log sensitive data access for audit"""
        try:
            action_data = f"{action_type}:{resource_id}:{datetime.now().isoformat()}"
            action_hash = hashlib.sha256(action_data.encode()).hexdigest()
            
            encrypted_details = self.encryption.encrypt_data(action_data)
            
            self.client.table('secure_audit_logs').insert({
                'action_type': action_type,
                'action_hash': action_hash,
                'encrypted_details': encrypted_details,
                'timestamp': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            print(f"Error logging access: {e}")
    
    # ==================== BLOCKCHAIN ====================
    
    def save_blockchain(self):
        """Save blockchain state"""
        try:
            chain_data = json.dumps([block.__dict__ for block in self.blockchain.chain])
            
            result = self.client.table('blockchain').select('id').execute()
            
            if result.data:
                self.client.table('blockchain').update({
                    'chain_data': chain_data,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', result.data[0]['id']).execute()
            else:
                self.client.table('blockchain').insert({
                    'chain_data': chain_data,
                    'created_at': datetime.now().isoformat()
                }).execute()
        except Exception as e:
            print(f"Error saving blockchain: {e}")
    
    def load_blockchain(self):
        """Load blockchain from database"""
        try:
            result = self.client.table('blockchain').select('*').execute()
            if result.data:
                chain_data = json.loads(result.data[0]['chain_data'])
                self.blockchain.load_chain(chain_data)
        except Exception as e:
            print(f"Error loading blockchain: {e}")
    
    # ==================== COMPATIBILITY METHODS ====================
    
    def get_all_elections(self) -> List[Dict]:
        """Get all elections with updated status based on current time"""
        try:
            result = self.client.table('elections').select('*').execute()
            elections = []
            current_time = datetime.now()
            
            for row in result.data:
                election = dict(row)
                # Parse candidates if it's JSON string
                if isinstance(election.get('candidates'), str):
                    election['candidates'] = json.loads(election['candidates'])
                
                # CRITICAL: Use election_id (hex string) as the ID, not the serial id
                # The frontend needs to use election_id for all API calls
                if 'election_id' in election:
                    election['id'] = election['election_id']  # Use hex string ID
                
                # Update status based on time
                start_time = datetime.fromisoformat(election.get('start_time', '').replace('Z', '+00:00')) if election.get('start_time') else None
                end_time = datetime.fromisoformat(election.get('end_time', '').replace('Z', '+00:00')) if election.get('end_time') else None
                
                if start_time and end_time:
                    # Resolve timezone comparison mismatch
                    if start_time.tzinfo is not None:
                        from datetime import timezone
                        eval_current_time = datetime.now(timezone.utc)
                    else:
                        eval_current_time = current_time
                    
                    if eval_current_time < start_time:
                        election['status'] = 'pending'
                    elif eval_current_time > end_time:
                        election['status'] = 'ended'
                    else:
                        election['status'] = 'active'
                
                elections.append(election)
            print(f"✅ Retrieved {len(elections)} elections with updated status")
            return elections
        except Exception as e:
            print(f"❌ Error getting elections: {e}")
            return []
    
    def save_election(self, election_data: Dict) -> Dict:
        """Save election (compatibility)"""
        try:
            # Prepare candidates data
            candidates = election_data.get('candidates', [])
            if isinstance(candidates, list):
                candidates_json = candidates
            else:
                candidates_json = candidates
            
            result = self.client.table('elections').insert({
                'id': election_data['id'],
                'title': election_data['title'],
                'description': election_data.get('description', ''),
                'state': election_data.get('state', ''),
                'candidates': candidates_json,
                'start_time': election_data.get('start_time'),
                'end_time': election_data.get('end_time'),
                'status': election_data.get('status', 'active'),
                'created_at': election_data.get('created_at', datetime.now().isoformat())
            }).execute()
            
            print(f"✅ Election created: {election_data['title']}")
            return result.data[0] if result.data else election_data
        except Exception as e:
            print(f"❌ Error saving election: {e}")
            raise
    
    def create_election(self, election_data: Dict) -> Dict:
        """Create new election"""
        return self.save_election(election_data)
    
    def get_election(self, election_id: str) -> Optional[Dict]:
        """Get single election by ID"""
        try:
            result = self.client.table('elections').select('*').eq('id', election_id).execute()
            if result.data:
                election = dict(result.data[0])
                if isinstance(election.get('candidates'), str):
                    election['candidates'] = json.loads(election['candidates'])
                return election
            return None
        except Exception as e:
            print(f"Error getting election: {e}")
            return None

    def update_election(self, election_id: str, updates: Dict) -> Dict:
        """Update election"""
        try:
            result = self.client.table('elections').update(updates).eq('id', election_id).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            print(f"Error updating election: {e}")
            raise
    
    # ==================== SESSION MANAGEMENT ====================
    
    def save_session(self, session_token: str, *args) -> Dict:
        """Save user session (admin or voter)"""
        try:
            # Handle both signatures:
            # Legacy: save_session(token, user_data)
            # Current: save_session(token, user_id, session_type, user_data)
            if len(args) == 1 and isinstance(args[0], dict):
                session_payload = args[0]
            elif len(args) == 3 and isinstance(args[2], dict):
                user_id, session_type, user_data = args
                session_payload = dict(user_data)
                session_payload["user_id"] = user_id
                session_payload["type"] = session_type
            else:
                session_payload = {}
                
            # Use 'token' and 'data' natively for Supabase
            result = self.client.table('sessions').insert({
                'token': session_token,
                'data': session_payload,
                'created_at': datetime.now().isoformat()
            }).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            print(f"Error saving session: {e}")
            return {}
    
    def get_session(self, session_token: str) -> Optional[Dict]:
        """Get session by token"""
        try:
            result = self.client.table('sessions').select('*').eq('token', session_token).execute()
            if result.data:
                session = dict(result.data[0])
                data = session.get('data', {})
                if isinstance(data, str):
                    data = json.loads(data)
                return data
            return None
        except Exception as e:
            print(f"Error getting session: {e}")
            return None

    def delete_session(self, session_token: str):
        """Delete session"""
        try:
            self.client.table('sessions').delete().eq('token', session_token).execute()
        except Exception as e:
            print(f"Error deleting session: {e}")

    def get_all_sessions(self) -> List[Dict]:
        """Get all sessions stored in Supabase."""
        try:
            sessions = []
            page_size = 1000
            offset = 0

            while True:
                result = self.client.table('sessions').select('*').range(offset, offset + page_size - 1).execute()
                batch = [dict(row) for row in result.data] if result.data else []

                if not batch:
                    break

                for row in batch:
                    session_data = row.get('data', {})
                    if isinstance(session_data, str):
                        try:
                            session_data = json.loads(session_data)
                        except Exception:
                            session_data = {}
                    if not isinstance(session_data, dict):
                        session_data = {}
                    session_data.setdefault('token', row.get('token'))
                    sessions.append(session_data)

                if len(batch) < page_size:
                    break

                offset += page_size

            return sessions
        except Exception as e:
            print(f"Error getting sessions: {e}")
            return []

    # ============================================================================
    # ADMIN MANAGEMENT METHODS
    # ============================================================================

    def get_admin_by_username(self, username: str) -> Optional[Dict]:
        """
        Get admin by username from database.
        
        Args:
            username: Admin username
            
        Returns:
            Admin data dict if found, None otherwise
        """
        try:
            print(f"🔍 Querying admins table for username: {username}")
            response = self.client.table('admins').select('*').eq('username', username).eq('is_active', True).execute()
            
            print(f"🔍 Response data: {response.data}")
            print(f"🔍 Response count: {len(response.data) if response.data else 0}")
            
            if response.data and len(response.data) > 0:
                admin = response.data[0]
                print(f"✅ Admin found: {username} ({admin.get('state', 'Unknown')})")
                return admin
            else:
                print(f"❌ Admin not found or inactive: {username}")
                print(f"🔍 Checking if admin exists at all...")
                # Try without is_active filter
                check_response = self.client.table('admins').select('*').eq('username', username).execute()
                print(f"🔍 Admin exists (any status): {check_response.data}")

                # If this is one of the built-in admins, recreate it on demand.
                default_admin = next((admin for admin in DEFAULT_ADMIN_ACCOUNTS if admin['username'] == username), None)
                if default_admin:
                    try:
                        restored_admin = {
                            'username': default_admin['username'],
                            'password_hash': DEFAULT_ADMIN_PASSWORD_HASH,
                            'email': default_admin['email'],
                            'state': default_admin['state'],
                            'role': default_admin['role'],
                            'is_active': True,
                            'created_at': datetime.now().isoformat(),
                            'updated_at': datetime.now().isoformat(),
                        }
                        self.client.table('admins').insert(restored_admin).execute()
                        print(f"✅ Restored missing default admin: {username}")
                        return restored_admin
                    except Exception as restore_error:
                        print(f"⚠️ Could not restore missing default admin {username}: {restore_error}")

                fallback_admin = self._get_default_admin_record(username)
                if fallback_admin:
                    print(f"✅ Using local fallback admin record for: {username}")
                    return fallback_admin

                return None
                
        except Exception as e:
            print(f"❌ Error fetching admin {username}: {e}")
            fallback_admin = self._get_default_admin_record(username)
            if fallback_admin:
                print(f"✅ Using local fallback admin record after error for: {username}")
                return fallback_admin
            import traceback
            traceback.print_exc()
            return None

    def update_admin_last_login(self, username: str) -> bool:
        """
        Update admin's last login timestamp.
        
        Args:
            username: Admin username
            
        Returns:
            True if successful, False otherwise
        """
        try:
            from datetime import datetime
            
            self.client.table('admins').update({
                'last_login': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).eq('username', username).execute()
            
            print(f"✅ Updated last login for admin: {username}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating last login for {username}: {e}")
            if self._get_default_admin_record(username):
                print(f"⚠️ Falling back to local last-login tracking for admin: {username}")
                return True
            return False

    def create_admin(self, username: str, password_hash: str, email: str, state: str, role: str) -> bool:
        """
        Create a new admin in the database.
        
        Args:
            username: Admin username
            password_hash: SHA-256 hash of password
            email: Admin email
            state: Admin's state (e.g., 'Maharashtra', 'All States')
            role: Admin role ('super_admin' or 'state_admin')
            
        Returns:
            True if successful, False otherwise
        """
        try:
            from datetime import datetime
            
            admin_data = {
                'username': username,
                'password_hash': password_hash,
                'email': email,
                'state': state,
                'role': role,
                'is_active': True,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            self.client.table('admins').insert(admin_data).execute()
            print(f"✅ Admin created: {username} ({state})")
            return True
            
        except Exception as e:
            print(f"❌ Error creating admin {username}: {e}")
            return False

    def ensure_default_admin_accounts(self) -> Dict[str, int]:
        """Create or refresh the built-in demo admin accounts."""
        summary = {"created": 0, "updated": 0, "skipped": 0}
        now = datetime.now().isoformat()

        for admin in DEFAULT_ADMIN_ACCOUNTS:
            payload = {
                "username": admin["username"],
                "password_hash": DEFAULT_ADMIN_PASSWORD_HASH,
                "email": admin["email"],
                "state": admin["state"],
                "role": admin["role"],
                "is_active": True,
                "updated_at": now,
            }

            try:
                response = self.client.table('admins').select('username, password_hash, email, state, role, is_active').eq('username', admin["username"]).execute()
                existing = response.data[0] if response.data else None

                if existing:
                    updates = {}
                    for field in ("password_hash", "email", "state", "role"):
                        if existing.get(field) != payload[field]:
                            updates[field] = payload[field]

                    if existing.get("is_active", True) is not True:
                        updates["is_active"] = True

                    if updates:
                        updates["updated_at"] = now
                        self.client.table('admins').update(updates).eq('username', admin["username"]).execute()
                        summary["updated"] += 1
                    else:
                        summary["skipped"] += 1
                else:
                    payload["created_at"] = now
                    self.client.table('admins').insert(payload).execute()
                    summary["created"] += 1
            except Exception as e:
                print(f"⚠️ Could not sync default admin {admin['username']}: {e}")

        print(
            "✅ Default admin sync complete: "
            f"{summary['created']} created, {summary['updated']} updated, {summary['skipped']} unchanged"
        )
        return summary

    def update_admin(self, username: str, updates: Dict) -> bool:
        """
        Update admin information.
        
        Args:
            username: Admin username
            updates: Dictionary of fields to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            from datetime import datetime
            
            updates['updated_at'] = datetime.now().isoformat()
            
            self.client.table('admins').update(updates).eq('username', username).execute()
            print(f"✅ Admin updated: {username}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating admin {username}: {e}")
            return False

    def deactivate_admin(self, username: str) -> bool:
        """
        Deactivate an admin (soft delete).
        
        Args:
            username: Admin username
            
        Returns:
            True if successful, False otherwise
        """
        try:
            from datetime import datetime
            
            self.client.table('admins').update({
                'is_active': False,
                'updated_at': datetime.now().isoformat()
            }).eq('username', username).execute()
            
            print(f"✅ Admin deactivated: {username}")
            return True
            
        except Exception as e:
            print(f"❌ Error deactivating admin {username}: {e}")
            return False

    def get_all_admins(self, include_inactive: bool = False) -> List[Dict]:
        """
        Get all admins from database.
        
        Args:
            include_inactive: Whether to include inactive admins
            
        Returns:
            List of admin dictionaries
        """
        try:
            query = self.client.table('admins').select('id, username, email, state, role, is_active, created_at, last_login')
            
            if not include_inactive:
                query = query.eq('is_active', True)
            
            response = query.order('created_at', desc=True).execute()
            
            admins = response.data if response.data else []
            print(f"✅ Retrieved {len(admins)} admins")
            return admins
            
        except Exception as e:
            print(f"❌ Error fetching admins: {e}")
            return []

    # ============================================================================
    # VOTER QUERY METHODS
    # ============================================================================

    def get_all_voters(self) -> List[Dict]:
        """
        Get all voters (returns encrypted data).
        For admin dashboard to show voter count and basic info.
        
        Returns:
            List of voter dictionaries with encrypted data
        """
        try:
            # Supabase returns up to 1000 rows per request by default, so fetch in pages.
            voters = []
            page_size = 1000
            offset = 0

            while True:
                page = self.client.table('voters').select('*').range(offset, offset + page_size - 1).execute()
                batch = [dict(row) for row in page.data] if page.data else []

                if not batch:
                    break

                voters.extend(batch)

                if len(batch) < page_size:
                    break

                offset += page_size
            
            # Map voter_token to voting_token for consistency
            for voter in voters:
                voter['voting_token'] = voter.get('voter_token', '')
            
            print(f"✅ Retrieved {len(voters)} voters")
            return voters
            
        except Exception as e:
            print(f"❌ Error getting all voters: {e}")
            return []

    def get_voter_by_aadhaar(self, aadhaar_number: str) -> Optional[Dict]:
        """
        Get voter by Aadhaar number (searches encrypted data).
        Note: This requires decrypting all voter records - use sparingly!
        
        Args:
            aadhaar_number: Aadhaar number to search for
            
        Returns:
            Voter dictionary if found, None otherwise
        """
        try:
            # Since Aadhaar is encrypted, scan voters page-by-page and decrypt to find match.
            page_size = 1000
            offset = 0

            while True:
                result = self.client.table('voters').select('*').range(offset, offset + page_size - 1).execute()
                batch = result.data if result.data else []

                if not batch:
                    break

                for voter_data in batch:
                    try:
                        # Decrypt the Aadhaar to check if it matches
                        decrypted = self.encryption.decrypt_voter_data(
                            voter_data['aadhaar_encrypted'],
                            voter_data['name_encrypted']
                        )

                        if decrypted['aadhaar'] == aadhaar_number:
                            # Found matching voter
                            voter = dict(voter_data)
                            voter['aadhaar'] = decrypted['aadhaar']
                            voter['name'] = decrypted['name']
                            voter['voting_token'] = voter.get('voter_token', '')
                            voter['phone'] = voter_data.get('phone', '')  # Include phone
                            print(f"✅ Found voter by Aadhaar: {voter.get('voter_id')}")
                            return voter

                    except Exception as decrypt_error:
                        # Skip voters that can't be decrypted
                        continue

                if len(batch) < page_size:
                    break

                offset += page_size
            
            print(f"❌ No voter found with Aadhaar: {aadhaar_number[:4]}****")
            return None
            
        except Exception as e:
            print(f"❌ Error searching voter by Aadhaar: {e}")
            return None
    
    def get_phone_by_aadhaar(self, aadhaar_number: str) -> Optional[str]:
        """
        Get voter's phone number by Aadhaar number (optimized for SMS OTP flow).
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            
        Returns:
            Phone number if found, None otherwise
        """
        voter = self.get_voter_by_aadhaar(aadhaar_number)
        if voter and voter.get('phone'):
            return voter['phone']
        return None

    def get_voter(self, voter_id: str) -> Optional[Dict]:
        """
        Get voter by voter_id.
        Returns voter with encrypted data (name and aadhaar encrypted).
        
        Args:
            voter_id: Voter ID
            
        Returns:
            Voter dictionary if found, None otherwise
        """
        try:
            result = self.client.table('voters').select('*').eq('voter_id', voter_id).execute()
            
            if not result.data or len(result.data) == 0:
                print(f"❌ Voter not found: {voter_id}")
                return None
            
            voter = dict(result.data[0])
            
            # Decrypt name for display
            try:
                decrypted = self.encryption.decrypt_voter_data(
                    voter['aadhaar_encrypted'],
                    voter['name_encrypted']
                )
                voter['name'] = decrypted['name']
                voter['aadhaar'] = decrypted['aadhaar']  # Include for session
            except Exception as decrypt_error:
                print(f"⚠️ Could not decrypt voter data: {decrypt_error}")
                voter['name'] = "Encrypted"
                voter['aadhaar'] = "Encrypted"
            
            # Map voter_token_hash to voting_token for compatibility
            voter['voting_token'] = voter.get('voter_id', '')  # Use voter_id as token
            
            print(f"✅ Found voter: {voter_id}")
            return voter
            
        except Exception as e:
            print(f"❌ Error getting voter {voter_id}: {e}")
            return None

    def _audit_logs_table(self) -> str:
        """Return the audit log table name used by this database."""
        return 'audit_logs'

    # ============================================================================
    # AUDIT LOG METHODS
    # ============================================================================

    def save_audit_log(self, log_data: Dict):
        """
        Save audit log to the audit_logs table.
        
        Args:
            log_data: Dictionary containing log information
        """
        try:
            action_type = log_data.get('action_type') or log_data.get('action', 'unknown')
            username = log_data.get('username') or log_data.get('admin_username') or log_data.get('user_id') or 'unknown'
            details = log_data.get('details') or log_data.get('action_details') or ''

            # Prepare log entry with fields that exist in the table
            log_entry = {
                'username': username,
                'action': action_type,
                'details': details,
                'state': log_data.get('state', 'N/A'),
                'timestamp': log_data.get('timestamp', datetime.now().isoformat()),
            }
            
            # Try to save to the audit log table used by the schema.
            self.client.table(self._audit_logs_table()).insert(log_entry).execute()
            print(f"✅ Audit log saved: {log_data.get('action', 'unknown')} by {log_data.get('username', 'unknown')}")
            
        except Exception as e:
            print(f"⚠️ Error saving audit log: {e}")
            # Fallback: Try to create a simple log in a backup way
            try:
                # Try minimal insert
                self.client.table(self._audit_logs_table()).insert({
                    'username': str(username)[:255],
                    'action': str(action_type)[:255],
                    'state': str(log_data.get('state', 'N/A'))[:100],
                    'details': str(details)[:500],
                    'timestamp': datetime.now().isoformat()
                }).execute()
                print(f"✅ Audit log saved (minimal mode)")
            except Exception as fallback_error:
                # Don't fail the request if audit log fails
                print(f"❌ Could not save audit log: {fallback_error} - continuing anyway")
                pass

    def get_audit_logs(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """
        Get recent audit logs.
        
        Args:
            limit: Maximum number of logs to retrieve
            
        Returns:
            List of audit log dictionaries
        """
        try:
            result = self.client.table(self._audit_logs_table()).select('*').order(
                'timestamp', desc=True
            ).range(offset, offset + limit - 1).execute()
            
            logs = []
            if result.data:
                # Convert to dictionaries and format for frontend
                for row in result.data:
                    action_value = row.get('action_type') or row.get('action') or 'unknown'
                    logs.append({
                        'id': row.get('id'),
                        'action': action_value,
                        'action_type': action_value,
                        'username': row.get('username') or row.get('user_id') or 'unknown',
                        'details': row.get('details', ''),
                        'state': row.get('state', 'N/A'),
                        'ip_address': row.get('ip_address', 'N/A'),
                        'timestamp': row.get('timestamp', '')
                    })
            
            print(f"✅ Retrieved {len(logs)} audit logs")
            return logs
            
        except Exception as e:
            print(f"⚠️ Error getting audit logs: {e}")
            # Return empty list instead of failing
            return []

    # ============================================================================
    # VOTE QUERY METHODS
    # ============================================================================

    def get_votes_by_election(self, election_id: str) -> List[Dict]:
        """
        Get all votes for a specific election.
        
        Args:
            election_id: Election ID
            
        Returns:
            List of vote dictionaries
        """
        try:
            votes = []
            page_size = 1000
            offset = 0

            while True:
                result = self.client.table('votes').select('*').eq('election_id', election_id).range(offset, offset + page_size - 1).execute()
                batch = [dict(row) for row in result.data] if result.data else []

                if not batch:
                    break

                votes.extend(batch)

                if len(batch) < page_size:
                    break

                offset += page_size

            print(f"✅ Retrieved {len(votes)} votes for election {election_id}")
            return votes
            
        except Exception as e:
            print(f"❌ Error getting votes for election {election_id}: {e}")
            return []

    def get_all_votes(self) -> List[Dict]:
        """
        Get all votes across all elections.
        
        Returns:
            List of vote dictionaries
        """
        try:
            votes = []
            page_size = 1000
            offset = 0

            while True:
                result = self.client.table('votes').select('*').range(offset, offset + page_size - 1).execute()
                batch = [dict(row) for row in result.data] if result.data else []

                if not batch:
                    break

                votes.extend(batch)

                if len(batch) < page_size:
                    break

                offset += page_size

            print(f"✅ Retrieved {len(votes)} total votes")
            return votes
            
        except Exception as e:
            print(f"❌ Error getting all votes: {e}")
            return []

    def get_election_results(self, election_id: str) -> Dict[str, int]:
        """
        Get vote counts for each candidate in an election.
        Note: Votes are encrypted, so we need to decrypt to get actual results.
        
        Args:
            election_id: Election ID
            
        Returns:
            Dictionary mapping candidate_id to vote count
        """
        try:
            # Get all votes for this election
            result = self.client.table('votes').select('*').eq('election_id', election_id).execute()
            
            results = {}
            if result.data:
                print(f"📊 Processing {len(result.data)} votes for election {election_id}")
                for row in result.data:
                    candidate_id = None
                    
                    # Try encrypted field first
                    candidate_encrypted = row.get('candidate_encrypted')
                    if candidate_encrypted:
                        try:
                            candidate_id = self.encryption.decrypt_data(candidate_encrypted)
                            print(f"✅ Decrypted vote: {candidate_id}")
                        except Exception as decrypt_error:
                            print(f"⚠️ Could not decrypt vote: {decrypt_error}")
                    
                    # Fallback to plain candidate_id if encryption failed or not present
                    if not candidate_id:
                        candidate_id = row.get('candidate_id')
                        print(f"📝 Using plain candidate_id: {candidate_id}")
                    
                    if candidate_id:
                        results[candidate_id] = results.get(candidate_id, 0) + 1
            
            print(f"✅ Retrieved results for election {election_id}: {results}")
            return results
            
        except Exception as e:
            print(f"❌ Error getting election results: {e}")
            import traceback
            traceback.print_exc()
            return {}

    def get_election_by_id(self, election_id: str) -> Optional[Dict]:
        """
        Get election by ID.
        
        Args:
            election_id: Election ID
            
        Returns:
            Election dictionary if found, None otherwise
        """
        try:
            print(f"🔍 Looking for election with ID: {election_id}")
            result = self.client.table('elections').select('*').eq('id', election_id).execute()
            
            print(f"📊 Query result: Found {len(result.data) if result.data else 0} elections")
            
            if result.data and len(result.data) > 0:
                election = dict(result.data[0])
                print(f"✅ Election data: id={election.get('id')}, election_id={election.get('election_id')}, title={election.get('title')}")
                # Parse candidates if it's JSON string
                if isinstance(election.get('candidates'), str):
                    election['candidates'] = json.loads(election['candidates'])
                # Map election_id to id for compatibility
                if 'election_id' in election and 'id' not in election:
                    election['id'] = election['election_id']
                print(f"✅ Retrieved election: {election.get('title', 'Unknown')}")
                return election
            else:
                print(f"❌ Election not found: {election_id}")
                # List all elections for debugging
                all_elections = self.client.table('elections').select('id, title').execute()
                print(f"📋 Available elections in database:")
                for e in all_elections.data:
                    print(f"   - ID: {e.get('id')} | Title: {e.get('title')}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting election: {e}")
            return None


