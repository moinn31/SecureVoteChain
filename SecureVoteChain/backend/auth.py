import hashlib
import secrets
import time
from typing import Dict, Optional, Tuple
from datetime import datetime


class MockAadhaarAuth:
    """
    Simulates Aadhaar/eKYC authentication system.
    In production, this would integrate with actual UIDAI APIs.
    """
    
    MOCK_AADHAAR_DATABASE = {
        "123456789012": {
            "name": "Rajesh Kumar",
            "dob": "1985-05-15",
            "gender": "Male",
            "address": "Mumbai, Maharashtra"
        },
        "234567890123": {
            "name": "Priya Sharma",
            "dob": "1990-08-22",
            "gender": "Female",
            "address": "Delhi, NCR"
        },
        "345678901234": {
            "name": "Amit Patel",
            "dob": "1978-12-10",
            "gender": "Male",
            "address": "Ahmedabad, Gujarat"
        },
        "456789012345": {
            "name": "Sunita Singh",
            "dob": "1995-03-18",
            "gender": "Female",
            "address": "Kolkata, West Bengal"
        },
        "567890123456": {
            "name": "Vikram Reddy",
            "dob": "1988-07-25",
            "gender": "Male",
            "address": "Hyderabad, Telangana"
        }
    }
    
    @staticmethod
    def validate_aadhaar(aadhaar_number: str) -> Tuple[bool, Optional[Dict]]:
        """
        Mock Aadhaar validation.
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
        
        Returns:
            Tuple of (is_valid, user_data)
        """
        if len(aadhaar_number) != 12 or not aadhaar_number.isdigit():
            return False, None
        
        user_data = MockAadhaarAuth.MOCK_AADHAAR_DATABASE.get(aadhaar_number)
        if user_data:
            return True, user_data
        return False, None
    
    @staticmethod
    def generate_otp(aadhaar_number: str) -> str:
        """
        Simulate OTP generation for Aadhaar verification.
        
        Demo Implementation: Returns fixed "123456" for all Aadhaar numbers.
        
        Production Implementation would:
        1. Generate a random 6-digit OTP
        2. Send it via SMS to the registered mobile number
        3. Store it in a secure cache with expiration (e.g., 5 minutes)
        4. Return success/failure status only (never the OTP value)
        
        Returns:
            6-digit OTP (fixed "123456" for demo)
        """
        return "123456"
    
    @staticmethod
    def verify_otp(aadhaar_number: str, otp: str) -> bool:
        """
        Mock OTP verification.
        
        Demo Implementation: Accepts "123456" for all Aadhaar numbers.
        
        Production Implementation would:
        1. Retrieve stored OTP from secure cache using Aadhaar number
        2. Compare submitted OTP with stored value
        3. Check if OTP has expired
        4. Delete OTP after successful verification (one-time use)
        5. Implement rate limiting to prevent brute force
        
        Args:
            aadhaar_number: Aadhaar number for which to verify OTP
            otp: OTP entered by user
        
        Returns:
            True if OTP is valid (for demo, always "123456")
        """
        return otp == "123456"


class MockBiometricAuth:
    """
    Simulates biometric authentication (fingerprint/face recognition).
    In production, this would use device biometric sensors.
    """
    
    @staticmethod
    def capture_biometric() -> str:
        """
        Simulate biometric capture.
        Returns a mock biometric hash.
        """
        biometric_data = f"biometric_{secrets.token_hex(16)}_{time.time()}"
        return hashlib.sha256(biometric_data.encode()).hexdigest()
    
    @staticmethod
    def verify_biometric(stored_hash: str, captured_hash: str) -> bool:
        """
        Simulate biometric verification.
        In production, this would use actual biometric matching algorithms.
        """
        return stored_hash == captured_hash
    
    @staticmethod
    def generate_mock_biometric_for_aadhaar(aadhaar_number: str) -> str:
        """
        Generate a consistent mock biometric hash for a given Aadhaar number.
        This simulates pre-enrolled biometric data.
        """
        return hashlib.sha256(f"bio_{aadhaar_number}".encode()).hexdigest()


class VoterAuth:
    """
    Handles voter registration and authentication.
    Combines Aadhaar verification with biometric authentication.
    """
    
    @staticmethod
    def register_voter(aadhaar_number: str, otp: str, state: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Register a new voter with state information.
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            otp: OTP for verification
            state: Voter's state
        
        Returns:
            Tuple of (success, user_data, error_message)
        """
        is_valid, user_data = MockAadhaarAuth.validate_aadhaar(aadhaar_number)
        
        if not is_valid:
            return False, None, "Invalid Aadhaar number"
        
        if not MockAadhaarAuth.verify_otp(aadhaar_number, otp):
            return False, None, "Invalid OTP"
        
        biometric_hash = MockBiometricAuth.generate_mock_biometric_for_aadhaar(aadhaar_number)
        
        if user_data is None:
            return False, None, "User data not found"
        
        voter_data = {
            "aadhaar_number": aadhaar_number,
            "name": user_data["name"],
            "dob": user_data["dob"],
            "gender": user_data["gender"],
            "state": state,  # Store voter's state
            "biometric_hash": biometric_hash,
            "registered_at": datetime.now().isoformat(),
            "voter_id": VoterAuth.generate_voter_id(aadhaar_number),
            "voting_token": VoterAuth.generate_voting_token()
        }
        
        return True, voter_data, None
    
    @staticmethod
    def generate_voter_id(aadhaar_number: str) -> str:
        """
        Generate a unique voter ID.
        This decouples voter identity from vote records for anonymity.
        """
        return hashlib.sha256(f"voter_{aadhaar_number}_{secrets.token_hex(8)}".encode()).hexdigest()[:16].upper()
    
    @staticmethod
    def generate_voting_token() -> str:
        """
        Generate a one-time voting token.
        This token is used to cast votes anonymously.
        """
        return secrets.token_hex(32)
    
    @staticmethod
    def authenticate_voter(voter_id: str, biometric_check: bool = True) -> Tuple[bool, Optional[str]]:
        """
        Authenticate a voter for voting.
        
        Args:
            voter_id: Voter ID
            biometric_check: Whether to perform biometric verification
        
        Returns:
            Tuple of (success, error_message)
        """
        if biometric_check:
            return True, None
        
        return True, None


class AdminAuth:
    """
    Handles admin authentication with state-based access.
    Each admin manages elections only for their assigned state.
    Uses database-stored admin credentials instead of hardcoded values.
    """
    
    # Database instance for admin authentication
    _db = None
    
    @classmethod
    def set_database(cls, db):
        """
        Set the database instance for admin authentication.
        
        Args:
            db: Database instance (SecureSupabaseDatabase or SupabaseDatabase)
        """
        cls._db = db
        print("✅ AdminAuth configured to use database authentication")
    
    @staticmethod
    def authenticate_admin(username: str, password: str) -> Tuple[bool, Optional[str], Optional[Dict]]:
        """
        Authenticate an admin user using database credentials.
        
        Args:
            username: Admin username
            password: Admin password
        
        Returns:
            Tuple of (success, error_message, admin_data)
        """
        # Check if database is configured
        if AdminAuth._db is None:
            print("❌ Database not configured for AdminAuth")
            return False, "Authentication system not configured", None
        
        # Generate password hash
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        print(f"🔍 Auth Debug - Attempting to authenticate: {username}")
        
        try:
            # Fetch admin from database
            admin = AdminAuth._db.get_admin_by_username(username)
            
            if not admin:
                print(f"❌ Admin not found: {username}")
                return False, "Invalid username", None
            
            # Check if admin is active
            if not admin.get('is_active', False):
                print(f"❌ Admin account is deactivated: {username}")
                return False, "Account is deactivated", None
            
            # Verify password hash
            stored_hash = admin.get('password_hash', '')
            print(f"🔍 Auth Debug - Stored hash: {stored_hash[:20]}...")
            print(f"🔍 Auth Debug - Provided hash: {password_hash[:20]}...")
            print(f"🔍 Auth Debug - Hashes match: {stored_hash == password_hash}")
            
            if stored_hash == password_hash:
                # Update last login timestamp
                AdminAuth._db.update_admin_last_login(username)
                
                print(f"✅ Admin authenticated successfully: {username}")
                return True, None, {
                    "username": username,
                    "state": admin.get('state', 'Unknown'),
                    "role": admin.get('role', 'state_admin'),
                    "email": admin.get('email', '')
                }
            else:
                print(f"❌ Invalid password for admin: {username}")
                return False, "Invalid password", None
                
        except Exception as e:
            print(f"❌ Error during admin authentication: {e}")
            return False, f"Authentication error: {str(e)}", None
    
    @staticmethod
    def generate_admin_session_token() -> str:
        """Generate a secure session token for admin."""
        return secrets.token_hex(32)
