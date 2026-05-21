from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field


# Indian States and Union Territories
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]


class Candidate(BaseModel):
    """Represents a candidate in an election."""
    id: str
    name: str
    party: str
    symbol: str
    description: Optional[str] = None
    photo: Optional[str] = None
    logo: Optional[str] = None
    photo_url: Optional[str] = None
    age: Optional[int] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    manifesto: Optional[str] = None
    achievements: Optional[List[str]] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    social_media: Optional[Dict[str, str]] = None  # {"twitter": "url", "facebook": "url"}


class Election(BaseModel):
    """Represents an election."""
    id: str
    title: str
    description: str
    state: str  # Indian state for this election
    start_time: str
    end_time: str
    candidates: List[Candidate]
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    created_by: Optional[str] = None  # Admin username who created it


class Vote(BaseModel):
    """Represents a vote (encrypted for anonymity)."""
    election_id: str
    candidate_id: str
    voter_token: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class VoterRegistration(BaseModel):
    """Voter registration request."""
    aadhaar_number: str
    phone: str  # Phone number for SMS OTP delivery (+91xxxxxxxxxx)
    otp: str
    state: str  # Voter's state
    name: Optional[str] = None  # Name from Aadhaar (optional during initial request)
    contact_phone: Optional[str] = None  # Additional contact number (optional)


class VoterLogin(BaseModel):
    """Voter login request."""
    voter_id: str


class AdminLogin(BaseModel):
    """Admin login request."""
    username: str
    password: str


class ElectionCreate(BaseModel):
    """Request to create a new election."""
    title: str
    description: str
    state: str  # State for this election
    start_time: str
    end_time: str
    candidates: List[Candidate]


class VoteRequest(BaseModel):
    """Request to cast a vote."""
    election_id: str
    candidate_id: str
    voter_token: str


class VoteVerification(BaseModel):
    """Request to verify a vote."""
    transaction_hash: str


class VoterFetchPhoneRequest(BaseModel):
    """Request to fetch a voter's phone number."""
    voter_id: Optional[str] = None
    aadhaar_number: str


class VoterRequestOtpRequest(BaseModel):
    """Request to generate and send an OTP to a voter."""
    aadhaar_number: str
    voter_id: Optional[str] = None


class VoterVerifyOtpRequest(BaseModel):
    """Request to verify an OTP and authenticate."""
    aadhaar_number: str
    otp: str
    voter_id: Optional[str] = None


class VoterSignupOtpRequest(BaseModel):
    """Request to generate and send an OTP for registration/signup."""
    aadhaar_number: str
    phone: str
    name: str

