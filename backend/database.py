import json
import os
import secrets
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from backend.blockchain import Blockchain


class Database:
    """
    Simple JSON file-based database for storing application data.
    In production, this would be replaced with PostgreSQL or similar.
    """
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        self.blockchain_file = os.path.join(data_dir, "blockchain.json")
        self.elections_file = os.path.join(data_dir, "elections.json")
        self.voters_file = os.path.join(data_dir, "voters.json")
        self.votes_file = os.path.join(data_dir, "votes.json")
        self.sessions_file = os.path.join(data_dir, "sessions.json")
        self.audit_logs_file = os.path.join(data_dir, "audit_logs.json")
        self.admins_file = os.path.join(data_dir, "admins.json")
        
        self.blockchain = Blockchain()
        self.initialize_files()
        self.load_blockchain()
    
    def initialize_files(self):
        """Create initial data files if they don't exist."""
        if not os.path.exists(self.elections_file):
            self.save_json(self.elections_file, [])
        
        if not os.path.exists(self.voters_file):
            self.save_json(self.voters_file, {})
        
        if not os.path.exists(self.votes_file):
            self.save_json(self.votes_file, {})
        
        if not os.path.exists(self.sessions_file):
            self.save_json(self.sessions_file, {})
        
        if not os.path.exists(self.audit_logs_file):
            self.save_json(self.audit_logs_file, [])

        if not os.path.exists(self.admins_file):
            self.save_json(self.admins_file, self._default_admins())
        
        if not os.path.exists(self.blockchain_file):
            self.save_blockchain()
    
    def save_json(self, filepath: str, data):
        """Save data to JSON file."""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_json(self, filepath: str):
        """Load data from JSON file."""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def save_blockchain(self):
        """Save blockchain to file."""
        self.save_json(self.blockchain_file, self.blockchain.get_chain())
    
    def load_blockchain(self):
        """Load blockchain from file."""
        chain_data = self.load_json(self.blockchain_file)
        if chain_data:
            self.blockchain.load_from_dict(chain_data)
    
    def add_election(self, election: Dict) -> bool:
        """Add a new election."""
        elections = self.load_json(self.elections_file) or []
        elections.append(election)
        self.save_json(self.elections_file, elections)
        
        block = self.blockchain.add_block({
            "type": "election_created",
            "election_id": election["id"],
            "title": election["title"],
            "timestamp": election["created_at"]
        })
        self.save_blockchain()
        return True
    
    def get_elections(self, state: Optional[str] = None) -> List[Dict]:
        """
        Get all elections, optionally filtered by state.
        
        Args:
            state: Filter elections by state. If "All States", return all elections.
        
        Returns:
            List of elections
        """
        elections = self.load_json(self.elections_file) or []
        
        if state and state != "All States":
            elections = [e for e in elections if e.get("state") == state]
        
        return elections
    
    def get_election_by_id(self, election_id: str) -> Optional[Dict]:
        """Get election by ID."""
        elections = self.get_elections()
        for election in elections:
            if election["id"] == election_id:
                return election
        return None
    
    def update_election_status(self, election_id: str, status: str) -> bool:
        """Update election status."""
        elections = self.get_elections()
        for election in elections:
            if election["id"] == election_id:
                election["status"] = status
                self.save_json(self.elections_file, elections)
                return True
        return False
    
    def register_voter(self, voter_data: Dict) -> bool:
        """Register a new voter."""
        voters = self.load_json(self.voters_file) or {}
        voter_id = voter_data["voter_id"]
        
        if voter_id in voters:
            return False
        
        voters[voter_id] = voter_data
        self.save_json(self.voters_file, voters)
        
        block = self.blockchain.add_block({
            "type": "voter_registered",
            "voter_id": voter_id,
            "name": voter_data["name"],
            "timestamp": voter_data["registered_at"]
        })
        self.save_blockchain()
        return True

    def save_election(self, election: Dict) -> bool:
        """Compatibility wrapper for Supabase-style API."""
        return self.add_election(election)

    def get_all_elections(self) -> List[Dict]:
        """Compatibility wrapper for Supabase-style API."""
        return self.get_elections()
    
    def get_voter(self, voter_id: str) -> Optional[Dict]:
        """Get voter by ID."""
        voters = self.load_json(self.voters_file) or {}
        voter = voters.get(voter_id)
        
        # Return voter data without sensitive token for security
        if voter:
            return voter
        return None
    
    def get_voter_with_state(self, voter_id: str) -> Optional[str]:
        """Get voter's state."""
        voter = self.get_voter(voter_id)
        return voter.get("state") if voter else None
    
    def get_voter_by_aadhaar(self, aadhaar_number: str) -> Optional[Dict]:
        """Get voter by Aadhaar number."""
        voters = self.load_json(self.voters_file) or {}
        for voter_id, voter_data in voters.items():
            if voter_data.get("aadhaar_number") == aadhaar_number:
                return voter_data
        return None
    
    def record_vote(self, vote_data: Dict) -> str:
        """
        Record a vote in the blockchain.
        
        Returns:
            Transaction hash for verification
        """
        votes = self.load_json(self.votes_file) or {}
        election_id = vote_data["election_id"]
        voter_token = vote_data["voter_token"]
        
        if election_id not in votes:
            votes[election_id] = {}
        
        votes[election_id][voter_token] = {
            "candidate_id": vote_data["candidate_id"],
            "timestamp": vote_data["timestamp"]
        }
        self.save_json(self.votes_file, votes)
        
        block = self.blockchain.add_block({
            "type": "vote",
            "election_id": election_id,
            "candidate_id": vote_data["candidate_id"],
            "timestamp": vote_data["timestamp"],
            "voter_token_hash": self.hash_token(voter_token)
        })
        self.save_blockchain()
        
        return block.hash
    
    def has_voted(self, election_id: str, voter_token: str) -> bool:
        """Check if a voter has already voted in an election."""
        votes = self.load_json(self.votes_file) or {}
        return election_id in votes and voter_token in votes[election_id]
    
    def get_election_results(self, election_id: str) -> Dict:
        """Get election results."""
        votes = self.load_json(self.votes_file) or {}
        election_votes = votes.get(election_id, {})
        
        results = {}
        for voter_token, vote_info in election_votes.items():
            candidate_id = vote_info["candidate_id"]
            results[candidate_id] = results.get(candidate_id, 0) + 1
        
        return results
    
    def save_session(self, session_token: str, *args):
        """Save a user session (supports legacy and current signatures)."""
        sessions = self.load_json(self.sessions_file) or {}

        # Legacy signature: save_session(token, user_data)
        if len(args) == 1 and isinstance(args[0], dict):
            sessions[session_token] = args[0]
        # Current signature: save_session(token, user_id, session_type, user_data)
        elif len(args) == 3 and isinstance(args[2], dict):
            user_id, session_type, user_data = args
            session_payload = dict(user_data)
            session_payload.setdefault("user_id", user_id)
            session_payload.setdefault("type", session_type)
            sessions[session_token] = session_payload
        else:
            raise ValueError("Invalid save_session arguments")

        self.save_json(self.sessions_file, sessions)
    
    def get_session(self, session_token: str) -> Optional[Dict]:
        """Get session data."""
        sessions = self.load_json(self.sessions_file) or {}
        return sessions.get(session_token)
    
    def delete_session(self, session_token: str):
        """Delete a session."""
        sessions = self.load_json(self.sessions_file) or {}
        if session_token in sessions:
            del sessions[session_token]
            self.save_json(self.sessions_file, sessions)
    
    def add_audit_log(self, log_entry: dict):
        """Add an entry to the audit log."""
        logs = self.load_json(self.audit_logs_file) or []
        logs.append(log_entry)
        self.save_json(self.audit_logs_file, logs)

    def save_audit_log(self, log_entry: dict):
        """Compatibility wrapper for Supabase-style API."""
        self.add_audit_log(log_entry)
    
    def get_audit_logs(self, limit: int = 100, state: Optional[str] = None) -> List[dict]:
        """Get audit logs, optionally filtered by state."""
        logs = self.load_json(self.audit_logs_file) or []
        
        if state:
            logs = [log for log in logs if log.get("admin_state") == state]
        
        # Return most recent logs first
        logs.reverse()
        return logs[:limit]
    
    def get_all_voters(self) -> List[dict]:
        """Get all voters for analytics."""
        voters_data = self.load_json(self.voters_file) or {}
        return list(voters_data.values())
    
    def get_all_votes(self) -> List[dict]:
        """Get all votes for analytics."""
        votes_data = self.load_json(self.votes_file) or {}
        all_votes = []
        for election_id, election_votes in votes_data.items():
            if isinstance(election_votes, dict):
                for voter_token, vote_info in election_votes.items():
                    all_votes.append({
                        "election_id": election_id,
                        "voter_token": voter_token,
                        "candidate_id": vote_info.get("candidate_id"),
                        "timestamp": vote_info.get("timestamp")
                    })
        return all_votes
    
    def get_votes_by_election(self, election_id: str) -> List[dict]:
        """Get all votes for a specific election."""
        votes_data = self.load_json(self.votes_file) or {}
        election_votes = votes_data.get(election_id, {})

        if isinstance(election_votes, dict):
            return [
                {
                    "election_id": election_id,
                    "voter_token": voter_token,
                    "candidate_id": vote_info.get("candidate_id"),
                    "timestamp": vote_info.get("timestamp")
                }
                for voter_token, vote_info in election_votes.items()
            ]

        return election_votes if isinstance(election_votes, list) else []

    def get_phone_by_aadhaar(self, aadhaar_number: str) -> Optional[str]:
        """Get a voter's phone number if available."""
        voter = self.get_voter_by_aadhaar(aadhaar_number)
        if not voter:
            return None
        return voter.get("phone") or voter.get("mobile")

    def get_admin_by_username(self, username: str) -> Optional[Dict]:
        """Get admin credentials from local JSON store."""
        admins = self.load_json(self.admins_file) or {}
        admin = admins.get(username)
        if not admin:
            return None
        if not admin.get("is_active", True):
            return None
        return admin

    def update_admin_last_login(self, username: str) -> bool:
        """Update admin last login timestamp in local JSON store."""
        admins = self.load_json(self.admins_file) or {}
        if username not in admins:
            return False
        admins[username]["last_login"] = datetime.now().isoformat()
        self.save_json(self.admins_file, admins)
        return True

    def _default_admins(self) -> Dict[str, Dict]:
        """Seed local fallback admins for offline/dev mode."""
        default_password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        now = datetime.now().isoformat()
        return {
            "admin": {
                "username": "admin",
                "password_hash": default_password_hash,
                "email": "admin@securevotechain.local",
                "state": "All States",
                "role": "super_admin",
                "is_active": True,
                "created_at": now,
                "last_login": None
            },
            "admin_maharashtra": {
                "username": "admin_maharashtra",
                "password_hash": default_password_hash,
                "email": "admin.maharashtra@securevotechain.local",
                "state": "Maharashtra",
                "role": "state_admin",
                "is_active": True,
                "created_at": now,
                "last_login": None
            }
        }
    
    def upsert_voter(self, aadhaar_number: str, name: str, state: str, phone: Optional[str] = None, voter_id: Optional[str] = None) -> Dict:
        """
        Insert or update voter by Aadhaar number.
        
        Args:
            aadhaar_number: Unique Aadhaar number
            name: Voter's name
            state: Voter's state
        
        Returns:
            Dict with keys: success (bool), action ('inserted' or 'updated'), voter_data
        """
        voters = self.load_json(self.voters_file) or {}
        
        # Check if voter exists with this Aadhaar
        existing_voter = None
        existing_voter_id = None
        
        for voter_id, voter_data in voters.items():
            if voter_data.get("aadhaar_number") == aadhaar_number:
                existing_voter = voter_data
                existing_voter_id = voter_id
                break
        
        timestamp = datetime.now().isoformat()
        
        if existing_voter:
            # Update existing voter
            voters[existing_voter_id]["name"] = name
            voters[existing_voter_id]["state"] = state
            if phone:
                voters[existing_voter_id]["phone"] = phone
            voters[existing_voter_id]["updated_at"] = timestamp
            self.save_json(self.voters_file, voters)
            
            return {
                "success": True,
                "action": "updated",
                "voter_data": voters[existing_voter_id]
            }
        else:
            # Insert new voter
            voter_id = voter_id or f"VOTER{len(voters) + 1:06d}"
            voter_token = secrets.token_urlsafe(32)
            
            voter_data = {
                "voter_id": voter_id,
                "aadhaar_number": aadhaar_number,
                "name": name,
                "state": state,
                "voter_token": voter_token,
                "phone": phone,
                "registered_at": timestamp,
                "updated_at": timestamp
            }
            
            voters[voter_id] = voter_data
            self.save_json(self.voters_file, voters)
            
            # Add to blockchain
            block = self.blockchain.add_block({
                "type": "voter_registered",
                "voter_id": voter_id,
                "aadhaar_number": aadhaar_number[:4] + "****" + aadhaar_number[-4:],  # Masked for privacy
                "name": name,
                "state": state,
                "timestamp": timestamp
            })
            self.save_blockchain()
            
            return {
                "success": True,
                "action": "inserted",
                "voter_data": voter_data
            }
    
    def bulk_import_voters(self, voters_list: List[Dict]) -> Dict:
        """
        Bulk import voters from list.
        
        Args:
            voters_list: List of dicts with keys: aadhaar_number, name, state, phone, voter_id
        
        Returns:
            Dict with keys: total, inserted, updated, errors
        """
        result = {
            "total": len(voters_list),
            "inserted": 0,
            "updated": 0,
            "errors": []
        }
        
        for idx, voter in enumerate(voters_list, 1):
            try:
                aadhaar = str(voter.get("aadhaar_number", "")).strip()
                name = str(voter.get("name", "")).strip()
                state = str(voter.get("state", "")).strip()
                phone = str(voter.get("phone", "")).strip() or None
                voter_id = str(voter.get("voter_id", "")).strip() or None
                
                # Validation
                if not aadhaar or not name or not state:
                    result["errors"].append({
                        "row": idx,
                        "error": "Missing required fields (aadhaar_number, name, or state)"
                    })
                    continue
                
                if len(aadhaar) < 12:
                    result["errors"].append({
                        "row": idx,
                        "error": f"Invalid Aadhaar number: {aadhaar}"
                    })
                    continue
                
                # Upsert voter
                upsert_result = self.upsert_voter(aadhaar, name, state, phone=phone, voter_id=voter_id)
                
                if upsert_result["success"]:
                    if upsert_result["action"] == "inserted":
                        result["inserted"] += 1
                    else:
                        result["updated"] += 1
                else:
                    result["errors"].append({
                        "row": idx,
                        "error": "Failed to save voter"
                    })
                    
            except Exception as e:
                result["errors"].append({
                    "row": idx,
                    "error": str(e)
                })
        
        return result
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token for privacy."""
        import hashlib
        return hashlib.sha256(token.encode()).hexdigest()
