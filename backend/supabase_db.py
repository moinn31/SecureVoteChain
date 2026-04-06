"""
Supabase PostgreSQL Database Implementation
Secure, scalable database for production use
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from supabase import create_client, Client
from backend.blockchain import Blockchain
import json


class SupabaseDatabase:
    """
    Production-ready PostgreSQL database using Supabase
    Replaces JSON file storage with secure cloud database
    """
    
    def __init__(self):
        # Get Supabase credentials from environment variables
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_KEY", "")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError(
                "⚠️ Missing Supabase credentials!\n"
                "Please set SUPABASE_URL and SUPABASE_KEY environment variables.\n"
                "Get them from: https://eizoypywgprahaztradc.supabase.co"
            )
        
        # Initialize Supabase client
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.blockchain = Blockchain()
        
        print("✅ Connected to Supabase PostgreSQL database")
    
    # ==================== ELECTIONS ====================
    
    def save_election(self, election_data: Dict) -> Dict:
        """Save election to database."""
        try:
            result = self.client.table('elections').insert({
                'id': election_data['id'],
                'title': election_data['title'],
                'description': election_data.get('description', ''),
                'state': election_data['state'],
                'candidates': json.dumps(election_data['candidates']),
                'start_time': election_data['start_time'],
                'end_time': election_data['end_time'],
                'status': election_data['status'],
                'created_at': datetime.now().isoformat()
            }).execute()
            
            return result.data[0] if result.data else election_data
        except Exception as e:
            print(f"Error saving election: {e}")
            raise
    
    def get_all_elections(self) -> List[Dict]:
        """Get all elections."""
        try:
            result = self.client.table('elections').select('*').execute()
            elections = []
            for row in result.data:
                election = dict(row)
                election['candidates'] = json.loads(election['candidates'])
                elections.append(election)
            return elections
        except Exception as e:
            print(f"Error getting elections: {e}")
            return []
    
    def get_election_by_id(self, election_id: str) -> Optional[Dict]:
        """Get election by ID."""
        try:
            result = self.client.table('elections').select('*').eq('id', election_id).execute()
            if result.data:
                election = dict(result.data[0])
                election['candidates'] = json.loads(election['candidates'])
                return election
            return None
        except Exception as e:
            print(f"Error getting election: {e}")
            return None
    
    def update_election_status(self, election_id: str, status: str):
        """Update election status."""
        try:
            self.client.table('elections').update({
                'status': status
            }).eq('id', election_id).execute()
        except Exception as e:
            print(f"Error updating election status: {e}")
    
    # ==================== VOTERS ====================
    
    def save_voter(self, voter_data: Dict):
        """Save voter to database."""
        try:
            # Handle both voter_token and voting_token keys for compatibility
            voter_token = voter_data.get('voter_token') or voter_data.get('voting_token', '')
            
            self.client.table('voters').insert({
                'voter_id': voter_data['voter_id'],
                'name': voter_data['name'],
                'state': voter_data['state'],
                'voter_token': voter_token,
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            print(f"Error saving voter: {e}")
            raise
    
    def get_voter(self, voter_id: str) -> Optional[Dict]:
        """Get voter by ID."""
        try:
            result = self.client.table('voters').select('*').eq('voter_id', voter_id).execute()
            return dict(result.data[0]) if result.data else None
        except Exception as e:
            print(f"Error getting voter: {e}")
            return None
    
    def get_all_voters(self) -> List[Dict]:
        """Get all voters."""
        try:
            result = self.client.table('voters').select('*').execute()
            return [dict(row) for row in result.data]
        except Exception as e:
            print(f"Error getting voters: {e}")
            return []
    
    def get_voter_by_aadhaar(self, aadhaar_number: str) -> Optional[Dict]:
        """Get voter by Aadhaar number."""
        try:
            result = self.client.table('voters').select('*').eq('aadhaar_number', aadhaar_number).execute()
            if result.data:
                voter = dict(result.data[0])
                # Map voter_token to voting_token for consistency
                voter['voting_token'] = voter.get('voter_token', '')
                return voter
            return None
        except Exception as e:
            print(f"Error getting voter by Aadhaar: {e}")
            return None
    
    def register_voter(self, voter_data: Dict):
        """Register/save a new voter (alias for save_voter for compatibility)."""
        return self.save_voter(voter_data)
    
    def bulk_import_voters(self, voters_list: List[Dict]) -> Dict:
        """
        Bulk import voters with upsert-by-aadhaar logic.
        Returns: {total, inserted, updated, errors}
        """
        inserted = 0
        updated = 0
        errors = []
        
        for idx, voter_row in enumerate(voters_list):
            try:
                # Validate required fields
                aadhaar = str(voter_row.get('aadhaar_number', '')).strip()
                name = str(voter_row.get('name', '')).strip()
                state = str(voter_row.get('state', '')).strip()
                
                if not aadhaar or not name or not state:
                    errors.append({
                        'row': idx + 1,
                        'error': 'Missing required fields (aadhaar_number, name, or state)'
                    })
                    continue
                
                if len(aadhaar) != 12 or not aadhaar.isdigit():
                    errors.append({
                        'row': idx + 1,
                        'error': f'Invalid Aadhaar number: {aadhaar}'
                    })
                    continue
                
                # Check if voter exists
                existing = self.get_voter_by_aadhaar(aadhaar)
                
                if existing:
                    # Update existing voter
                    self.client.table('voters').update({
                        'name': name,
                        'state': state,
                        'updated_at': datetime.now().isoformat()
                    }).eq('aadhaar_number', aadhaar).execute()
                    updated += 1
                else:
                    # Insert new voter
                    import secrets
                    voter_id = f"{state[:2].upper()}{secrets.token_hex(4).upper()}"
                    voter_token = secrets.token_hex(16)
                    
                    self.client.table('voters').insert({
                        'voter_id': voter_id,
                        'aadhaar_number': aadhaar,
                        'name': name,
                        'state': state,
                        'voter_token': voter_token,
                        'created_at': datetime.now().isoformat()
                    }).execute()
                    inserted += 1
                    
            except Exception as e:
                errors.append({
                    'row': idx + 1,
                    'error': str(e)
                })
        
        return {
            'total': len(voters_list),
            'inserted': inserted,
            'updated': updated,
            'errors': errors
        }
    
    # ==================== VOTES ====================
    
    def save_vote(self, election_id: str, vote_data: Dict):
        """Save vote to database."""
        try:
            self.client.table('votes').insert({
                'election_id': election_id,
                'candidate_id': vote_data['candidate_id'],
                'voter_token_hash': vote_data['voter_token'],  # Hashed for privacy
                'transaction_hash': vote_data['transaction_hash'],
                'timestamp': vote_data['timestamp']
            }).execute()
        except Exception as e:
            print(f"Error saving vote: {e}")
            raise
    
    def has_voted(self, election_id: str, voter_token: str) -> bool:
        """Check if voter has already voted in election."""
        try:
            result = self.client.table('votes').select('id').eq(
                'election_id', election_id
            ).eq('voter_token_hash', voter_token).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f"Error checking vote status: {e}")
            return False
    
    def get_votes_by_election(self, election_id: str) -> List[Dict]:
        """Get all votes for an election."""
        try:
            result = self.client.table('votes').select('*').eq('election_id', election_id).execute()
            return [dict(row) for row in result.data]
        except Exception as e:
            print(f"Error getting votes: {e}")
            return []
    
    def get_all_votes(self) -> List[Dict]:
        """Get all votes."""
        try:
            result = self.client.table('votes').select('*').execute()
            return [dict(row) for row in result.data]
        except Exception as e:
            print(f"Error getting all votes: {e}")
            return []
    
    def get_election_results(self, election_id: str) -> Dict[str, int]:
        """Get vote counts for each candidate."""
        try:
            result = self.client.table('votes').select('candidate_id').eq('election_id', election_id).execute()
            
            results = {}
            for row in result.data:
                candidate_id = row['candidate_id']
                results[candidate_id] = results.get(candidate_id, 0) + 1
            
            return results
        except Exception as e:
            print(f"Error getting results: {e}")
            return {}
    
    def record_vote(self, vote_data: Dict) -> str:
        """
        Record a vote on blockchain and in database.
        Returns the transaction hash.
        """
        import hashlib
        
        # Generate transaction hash
        vote_string = f"{vote_data['election_id']}{vote_data['candidate_id']}{vote_data['timestamp']}"
        transaction_hash = hashlib.sha256(vote_string.encode()).hexdigest()
        
        # Add to blockchain
        self.blockchain.add_block({
            'election_id': vote_data['election_id'],
            'candidate_id': vote_data['candidate_id'],
            'timestamp': vote_data['timestamp'],
            'transaction_hash': transaction_hash
        })
        
        # Save blockchain state
        self.save_blockchain()
        
        # Save vote to database
        vote_data['transaction_hash'] = transaction_hash
        self.save_vote(vote_data['election_id'], vote_data)
        
        return transaction_hash
    
    # ==================== SESSIONS ====================
    
    def save_session(self, token: str, session_data: Dict):
        """Save session to database."""
        try:
            self.client.table('sessions').insert({
                'token': token,
                'data': json.dumps(session_data),
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            print(f"Error saving session: {e}")
    
    def get_session(self, token: str) -> Optional[Dict]:
        """Get session by token."""
        try:
            result = self.client.table('sessions').select('*').eq('token', token).execute()
            if result.data:
                return json.loads(result.data[0]['data'])
            return None
        except Exception as e:
            print(f"Error getting session: {e}")
            return None
    
    # ==================== AUDIT LOGS ====================
    
    def save_audit_log(self, log_data: Dict):
        """Save audit log to database."""
        try:
            self.client.table('audit_logs').insert({
                'username': log_data.get('username', 'unknown'),
                'action': log_data['action'],
                'details': log_data.get('details', ''),
                'state': log_data.get('state', ''),
                'timestamp': log_data['timestamp']
            }).execute()
        except Exception as e:
            print(f"Error saving audit log: {e}")
    
    def get_audit_logs(self, limit: int = 100) -> List[Dict]:
        """Get recent audit logs."""
        try:
            result = self.client.table('audit_logs').select('*').order(
                'timestamp', desc=True
            ).limit(limit).execute()
            return [dict(row) for row in result.data]
        except Exception as e:
            print(f"Error getting audit logs: {e}")
            return []
    
    # ==================== BLOCKCHAIN ====================
    
    def save_blockchain(self):
        """Save blockchain state to database."""
        try:
            chain_data = json.dumps([block.__dict__ for block in self.blockchain.chain])
            
            # Upsert blockchain data
            result = self.client.table('blockchain').select('id').execute()
            
            if result.data:
                # Update existing
                self.client.table('blockchain').update({
                    'chain_data': chain_data,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', result.data[0]['id']).execute()
            else:
                # Insert new
                self.client.table('blockchain').insert({
                    'chain_data': chain_data,
                    'created_at': datetime.now().isoformat()
                }).execute()
        except Exception as e:
            print(f"Error saving blockchain: {e}")
    
    def load_blockchain(self):
        """Load blockchain from database."""
        try:
            result = self.client.table('blockchain').select('*').execute()
            if result.data:
                chain_data = json.loads(result.data[0]['chain_data'])
                self.blockchain.load_chain(chain_data)
        except Exception as e:
            print(f"Error loading blockchain: {e}")
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token for privacy."""
        import hashlib
        return hashlib.sha256(token.encode()).hexdigest()
