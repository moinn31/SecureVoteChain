# Blockchain-Enabled Secure Voting Platform MVP

## Project Overview

This is a web-based voting platform prototype that demonstrates blockchain principles using cryptographic hashing and simulated authentication. The system showcases secure, transparent, and tamper-proof digital elections using Python FastAPI backend and vanilla JavaScript frontend.

## Architecture

### Backend (Python FastAPI)
- **main.py**: FastAPI application with all API endpoints
- **backend/blockchain.py**: Simulated blockchain using SHA-256 hash chains
- **backend/auth.py**: Mock Aadhaar and biometric authentication system
- **backend/database.py**: JSON file-based database for data persistence
- **backend/models.py**: Pydantic models for data validation

### Frontend (HTML/CSS/JavaScript)
- **templates/**: HTML templates for landing, admin, and voter pages
- **static/**: CSS and JavaScript files for UI and client-side logic

### Data Storage
- **data/**: JSON files storing blockchain, elections, voters, votes, and sessions

## Key Features

### 1. Simulated Blockchain
- **SHA-256 Hash Chains**: Each block is cryptographically linked to the previous block
- **Immutability**: Any tampering with past blocks breaks the chain and is detectable
- **Transparency**: Full blockchain audit trail available for verification
- **Block Structure**: Index, timestamp, data, previous hash, and current hash

### 2. Mock Authentication
- **Aadhaar Simulation**: 5 pre-configured Aadhaar numbers with user data
- **OTP Verification**: Fixed demo OTP "123456" for all accounts (documented in UI, not in API responses)
- **Biometric Hash**: Cryptographic hash generated for each voter (simulated)
- **Voter Tokens**: One-time tokens decouple identity from votes for anonymity

**Security Note**: The demo uses a fixed OTP (123456) documented in the UI for ease of testing. In production:
- OTP would be randomly generated and sent via SMS
- OTP would be stored server-side with expiration
- API would never disclose OTP values
- Rate limiting would prevent brute force attacks

### 3. Admin Dashboard
- Create and manage elections with multiple candidates
- View real-time election results
- Access complete blockchain audit trail
- Verify blockchain integrity

### 4. Voter Portal
- Register using Aadhaar and OTP verification
- Login with Voter ID
- Cast votes in active elections (one vote per election)
- Verify vote inclusion using transaction hash

### 5. Security Features
- Session-based authentication for both admin and voters
- One vote per voter per election enforcement
- Cryptographic vote recording
- Transaction hash for vote verification
- Complete audit trail

## Demo Credentials

### Admin Access
- **Username**: admin
- **Password**: admin123

### Sample Aadhaar Numbers
All use OTP: **123456**
- 123456789012 - Rajesh Kumar
- 234567890123 - Priya Sharma
- 345678901234 - Amit Patel
- 456789012345 - Sunita Singh
- 567890123456 - Vikram Reddy

## How to Use

### For Voters:
1. Go to Voter Portal
2. Register with Aadhaar number → Request OTP → Enter OTP (123456)
3. Save your Voter ID and Token (displayed after registration)
4. Login with your Voter ID
5. Select an active election and vote for a candidate
6. Save the transaction hash received after voting
7. Use "Verify Vote" tab to confirm your vote was recorded

### For Admins:
1. Go to Admin Dashboard
2. Login with admin credentials
3. Create election with title, description, dates, and candidates
4. View results in "View Elections" tab
5. Check blockchain integrity in "Blockchain Audit" tab

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/voter/request-otp` - Request OTP for voter registration
- `POST /api/voter/register` - Register new voter
- `POST /api/voter/login` - Voter login

### Elections
- `POST /api/admin/elections` - Create new election (admin only)
- `GET /api/elections` - Get all elections
- `GET /api/elections/{election_id}` - Get election details
- `GET /api/elections/{election_id}/results` - Get election results

### Voting
- `POST /api/vote` - Cast a vote
- `POST /api/verify-vote` - Verify vote using transaction hash

### Blockchain
- `GET /api/blockchain` - Get entire blockchain
- `GET /api/blockchain/verify` - Verify blockchain integrity

## Technology Stack

- **Backend**: Python 3.11, FastAPI, Uvicorn
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: SHA-256 hashing, session tokens
- **Storage**: JSON files (simulating database)
- **Templates**: Jinja2

## Blockchain Implementation

### Block Structure
```python
{
    "index": int,           # Block number in chain
    "timestamp": float,     # Unix timestamp
    "data": dict,           # Vote or election data
    "previous_hash": str,   # Hash of previous block
    "hash": str            # SHA-256 hash of this block
}
```

### Hash Chain Verification
1. Each block contains the hash of the previous block
2. Any modification to a block changes its hash
3. This breaks the link to subsequent blocks
4. Verification process checks all links in the chain

## Future Enhancements

### Production-Ready Features
1. **Real Blockchain Integration**
   - Deploy to Ethereum testnet or Polygon
   - Implement smart contracts for voting logic
   - Use web3.py for blockchain interaction

2. **Actual Authentication**
   - Integrate real Aadhaar/eKYC APIs
   - Implement device biometric verification
   - Secure key management (HSM/KMS)

3. **Enhanced Security**
   - Zero-knowledge proofs for privacy
   - Multi-signature approval for elections
   - Threshold encryption for results
   - Rate limiting and DDoS protection

4. **Database Migration**
   - Move from JSON to PostgreSQL
   - Implement proper ORM (SQLAlchemy)
   - Add database migrations (Alembic)

5. **Additional Features**
   - Real-time vote counting dashboard
   - Multi-language support (Hindi, English)
   - Email/SMS notifications
   - Export election reports
   - Voter eligibility verification

## Project Status

**Current State**: Fully functional MVP demonstrating blockchain voting concepts

**Last Updated**: October 28, 2025

## Development Notes

### Code Organization
- Modular design allows easy integration of real blockchain and authentication
- Clear separation between backend logic and frontend UI
- Comprehensive error handling and validation
- Well-documented code with docstrings

### Testing the Application
1. Start server (automatically runs via Workflow)
2. Visit the home page to understand the system
3. Test admin flow: Create election with candidates
4. Test voter flow: Register → Login → Vote → Verify
5. Check blockchain audit trail in admin dashboard

### Known Limitations
- JSON-based storage (not production-ready)
- Simulated blockchain (not distributed)
- Mock authentication (not legally compliant)
- No real-time updates (requires page refresh)
- Single server deployment (not scalable)

## Compliance Notes

This is a **demonstration prototype** only. For production use:
- Obtain proper government approval for e-voting
- Follow UIDAI guidelines for Aadhaar integration
- Implement data protection and privacy regulations
- Conduct security audits and penetration testing
- Ensure accessibility and usability compliance

## Support

For technical questions or issues, review the code comments and API documentation. The system is designed to be self-explanatory with comprehensive error messages.
