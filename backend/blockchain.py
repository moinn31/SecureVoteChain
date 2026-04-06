import hashlib
import json
import time
from datetime import datetime
from typing import List, Dict, Optional


class Block:
    """
    Represents a single block in the blockchain.
    Each block contains vote data and is cryptographically linked to the previous block.
    """
    
    def __init__(self, index: int, timestamp: float, data: Dict, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """
        Calculate SHA-256 hash of block contents.
        This creates the cryptographic link in the chain.
        """
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        """Convert block to dictionary for JSON serialization."""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }


class Blockchain:
    """
    Simulated blockchain for secure voting.
    Uses SHA-256 hash chains to ensure immutability and tamper-evidence.
    """
    
    def __init__(self):
        self.chain: List[Block] = []
        self.create_genesis_block()
    
    def create_genesis_block(self):
        """Create the first block in the chain."""
        genesis_block = Block(
            index=0,
            timestamp=time.time(),
            data={"type": "genesis", "message": "Blockchain Voting System Initialized"},
            previous_hash="0"
        )
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Get the most recent block in the chain."""
        return self.chain[-1]
    
    def add_block(self, data: Dict) -> Block:
        """
        Add a new block to the chain.
        
        Args:
            data: Dictionary containing vote or election data
        
        Returns:
            The newly created block
        """
        latest_block = self.get_latest_block()
        new_block = Block(
            index=latest_block.index + 1,
            timestamp=time.time(),
            data=data,
            previous_hash=latest_block.hash
        )
        self.chain.append(new_block)
        return new_block
    
    def is_chain_valid(self) -> bool:
        """
        Verify the integrity of the blockchain.
        Checks that all hash links are valid and blocks haven't been tampered with.
        
        Returns:
            True if chain is valid, False otherwise
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            if current_block.hash != current_block.calculate_hash():
                return False
            
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def get_chain(self) -> List[Dict]:
        """Get the entire blockchain as a list of dictionaries."""
        return [block.to_dict() for block in self.chain]
    
    def get_block_by_hash(self, block_hash: str) -> Optional[Dict]:
        """
        Find a block by its hash or transaction hash.
        Used for vote verification.
        
        Args:
            block_hash: The hash of the block or transaction_hash to find
        
        Returns:
            Block dictionary if found, None otherwise
        """
        for block in self.chain:
            # Check if it matches the block hash
            if block.hash == block_hash:
                return block.to_dict()
            # Also check if it matches the transaction_hash in the data
            if isinstance(block.data, dict) and block.data.get('transaction_hash') == block_hash:
                return block.to_dict()
        return None
    
    def get_blocks_by_election(self, election_id: str) -> List[Dict]:
        """
        Get all blocks related to a specific election.
        
        Args:
            election_id: The ID of the election
        
        Returns:
            List of blocks for that election
        """
        election_blocks = []
        for block in self.chain:
            if block.data.get("type") == "vote" and block.data.get("election_id") == election_id:
                election_blocks.append(block.to_dict())
        return election_blocks
    
    def load_from_dict(self, chain_data: List[Dict]):
        """
        Load blockchain from saved data.
        
        Args:
            chain_data: List of block dictionaries
        """
        self.chain = []
        for block_data in chain_data:
            block = Block(
                index=block_data["index"],
                timestamp=block_data["timestamp"],
                data=block_data["data"],
                previous_hash=block_data["previous_hash"]
            )
            block.hash = block_data["hash"]
            self.chain.append(block)
