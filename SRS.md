# Software Requirements Specification (SRS)

## 1. Project Title

SecureVoteChain – Blockchain-enabled Secure Voting Platform

## 2. Introduction

### 2.1 Purpose
This SRS describes the requirements for SecureVoteChain, a web-based, tamper-evident voting platform designed to support secure, auditable elections with an admin dashboard and voter portal. It defines functional, non-functional, data, interface, and security requirements to guide development, testing, deployment, and maintenance.

### 2.2 Scope
SecureVoteChain enables authorized administrators to create and manage elections, register or import voters, and monitor turnout/results. Voters can securely authenticate and cast their ballots. Each vote is recorded to an append-only blockchain ledger for auditability. The system supports multi-language UI for Indian languages, dark mode, and integrates with Supabase (PostgreSQL) for production storage with an optional JSON file store for development.

Core modules:
- Admin Portal: authentication, election lifecycle, voter import, analytics, audit logs.
- Voter Portal: authentication, election list, ballot casting, receipt/verification.
- Blockchain Ledger: tamper-evident vote records (hash-linked blocks).
- Database Layer: Supabase/PostgreSQL (primary), JSON files (development fallback).
- Internationalization & Theming: multiple Indian languages, theme toggle.

### 2.3 Definitions, Acronyms, and Abbreviations
- Aadhaar: 12-digit unique identity number issued by UIDAI (used in demo via mock).
- OTP: One-Time Password (demo-fixed 123456 in MockAadhaarAuth).
- RLS: Row Level Security (Supabase/PostgreSQL feature to restrict row access).
- SVC: SecureVoteChain.
- Supabase: Hosted PostgreSQL with APIs and auth; used here for DB.
- FastAPI: Python web framework used for backend REST APIs.
- JSON DB: Development-mode storage using JSON files.
- Admin roles: super_admin (all states), state_admin (assigned state only).

## 3. Overall Description

### 3.1 Product Perspective
SecureVoteChain is a web application with a FastAPI backend and HTML/CSS/JS frontend. It serves:
- Admin UI (admin.html + admin.js)
- Voter UI (voter.html + voter.js)
- Statistics and verification pages
Data persistence is via Supabase/PostgreSQL; JSON files are used for local/dev. The vote recording layer maintains a simplified blockchain (hash-linked blocks) written alongside DB state for auditability.

### 3.2 Product Functions
- Admin authentication (role- and state-based access).
- Create/manage elections (title, description, state, timeframe, candidates).
- Import voters from CSV/XLSX (Aadhaar/ID, name, state) with upsert.
- View dashboards: turnout, active elections, votes, state breakdown.
- Record actions to audit logs.
- Voter authentication (voter ID/token; Aadhaar OTP in demo via mock).
- List available elections to the voter by state; cast vote once per election.
- Generate in-page receipt/verification; expose verification page.
- Blockchain append for tamper-evident vote trail.
- Multi-language UI (major Indian languages) and dark mode theme.

### 3.3 User Classes and Characteristics
- Super Admin: manages all states, can view and operate globally.
- State Admin: manages one assigned state; limited to that scope.
- Voter: casts vote in elections for their state, once per election.
- Auditor/Observer (future): read-only access to results and blockchain.

### 3.4 Operating Environment
- Server: Python 3.10+ (FastAPI, Uvicorn), internet-connected host.
- Database: Supabase/PostgreSQL (production); local JSON files (dev).
- Client: Modern browsers (Chrome, Edge, Firefox, Safari), desktop/mobile.
- Optional tools: pandas/openpyxl for Excel/CSV import.

### 3.5 Design and Implementation Constraints
- Sessions stored server-side; admin endpoints require Bearer token.
- Supabase RLS may block operations unless policies are configured (sessions table needs permissive policy or RLS disabled in development).
- Demo OTP uses a fixed value and mock Aadhaar data; production must integrate with real eKYC/OTP providers.
- Privacy: Voter token hashes stored with votes; personally identifiable information (PII) must not be linkable to cast ballots.
- Performance: Blockchain is simplified and not a distributed chain (tamper-evident, not decentralized).

### 3.6 Assumptions and Dependencies
- Network connectivity for clients and server.
- Supabase credentials (SUPABASE_URL, SUPABASE_KEY) provided via environment.
- Admins keep credentials secure; voters receive valid IDs/tokens.
- Time synchronization for election start/end windows.
- Future integration with SMS/Email providers for OTP/notifications.

## 4. Functional Requirements

FR-1 Admin Authentication
- FR-1.1 The system shall authenticate admins via username and password.
- FR-1.2 The system shall assign roles: super_admin (all states), state_admin (single state).
- FR-1.3 The system shall create a server-side session token on successful login.

FR-2 Election Management
- FR-2.1 Admins shall create elections with title, description, state, candidates, start/end time.
- FR-2.2 Admins shall view existing elections filtered by role/state.
- FR-2.3 Admins shall update election status automatically by time and manually where allowed.

FR-3 Voter Management
- FR-3.1 Admins shall import voters via CSV/XLSX with required columns (aadhaar_number or voter_id, name, state).
- FR-3.2 The system shall upsert voters on import (avoid duplicates by Aadhaar/ID).
- FR-3.3 Admins shall view voters (restricted by state).

FR-4 Voting
- FR-4.1 Voters shall authenticate (voter_id + voter_token); optional Aadhaar OTP flow in demo.
- FR-4.2 Voters shall see only active elections for their state.
- FR-4.3 The system shall allow exactly one vote per voter per election.
- FR-4.4 The system shall record a vote with timestamp and transaction hash; store token hash, not the token itself.

FR-5 Blockchain Audit Trail
- FR-5.1 Each successful vote shall append a block to the local blockchain ledger (hash-linked).
- FR-5.2 The system shall expose a verification endpoint to review the chain integrity.

FR-6 Analytics and Dashboard
- FR-6.1 Admins shall view total voters, elections, active elections, and total votes.
- FR-6.2 Admins shall view state-wise turnout metrics and charts.

FR-7 Audit Logging
- FR-7.1 The system shall log admin actions (login, create election, import voters, etc.).
- FR-7.2 Audit logs shall include username, state, action, details, and timestamp.

FR-8 Internationalization & Theming
- FR-8.1 Users shall switch UI language among major Indian languages and English.
- FR-8.2 The system shall persist language preference and apply on load.
- FR-8.3 Users shall toggle dark/light themes; preference is persisted.

FR-9 Data Export (Admin)
- FR-9.1 Admins shall download sample voter import templates.
- FR-9.2 Admins shall export election results (CSV/JSON) for reporting.

## 5. Non-Functional Requirements

NFR-1 Performance
- NFR-1.1 Typical API responses shall complete within 500 ms under nominal load.
- NFR-1.2 The system shall support at least 50 concurrent admin users and 5,000 concurrent voters in production (scalable with Supabase and horizontal app scaling).

NFR-2 Availability & Reliability
- NFR-2.1 The production system shall target 99.5% uptime during election windows.
- NFR-2.2 Server restarts shall not corrupt or lose recorded votes (DB transactions and chain persistence).

NFR-3 Security
- NFR-3.1 All traffic shall use HTTPS in production.
- NFR-3.2 Sensitive secrets (DB keys) shall never be hardcoded and must be provided via environment variables.
- NFR-3.3 Supabase RLS policies shall be configured; dev-only tables (e.g., sessions) may disable RLS for convenience.

NFR-4 Privacy
- NFR-4.1 No PII shall be stored in the vote records; only anonymized/hashes.
- NFR-4.2 Access to voter data shall be restricted by role and state.

NFR-5 Usability & Accessibility
- NFR-5.1 UI shall be responsive for desktop and mobile.
- NFR-5.2 Color contrast and keyboard navigation shall follow WCAG AA where feasible.
- NFR-5.3 Multi-language text shall render correctly for supported scripts.

NFR-6 Maintainability & Observability
- NFR-6.1 Code shall be modular (backend: FastAPI routers/services; frontend: modular JS files).
- NFR-6.2 Server logs shall capture authentication failures and critical events.

## 6. Data Requirements

Entities (Supabase/PostgreSQL):
- elections(id, title, description, state, candidates JSONB, start_time, end_time, status, created_at, updated_at)
- voters(id, voter_id, aadhaar_number, name, state, voter_token, created_at, updated_at)
- votes(id, election_id, candidate_id, voter_token_hash, transaction_hash, timestamp)
- sessions(id, token, data JSONB, created_at, expires_at)
- audit_logs(id, username, action, details, state, timestamp)
- blockchain(id, chain_data JSONB, created_at, updated_at)

Constraints:
- Unique indices on voter_id, aadhaar_number, and transaction_hash.
- Indexes for state and election_id for fast filtering.

Data Retention:
- Sessions expire after 24 hours (configurable).
- Audit logs retained per compliance policy (configurable).

## 7. External Interface Requirements

### 7.1 User Interfaces
- Admin: admin.html + admin.js; features include login, dashboard metrics, election management, voter import, audit log view, theme/language selectors.
- Voter: voter.html + voter.js; features include login, elections list, candidate profiles, ballot casting, receipt/verification link.
- Statistics: statistics.html; charts powered by Chart.js.
- Candidate profile: candidate.html with images and biography fields.

### 7.2 Hardware Interfaces
- Standard web client devices (desktop/laptop/mobile) with modern browsers.
- Server host with sufficient CPU/RAM; no specialized hardware required.

### 7.3 Software Interfaces
- FastAPI (Python), Uvicorn ASGI server.
- Supabase Python client (PostgreSQL).
- pandas/openpyxl for CSV/XLSX processing.
- Chart.js for analytics charts.

### 7.4 Communication Interfaces
- RESTful HTTP/HTTPS APIs (JSON) with CORS enabled.
- Admin endpoints require Authorization: Bearer <session_token> header.

## 8. System Features / Use Cases

Use Case UC-1: Admin Login
- Actors: Admin (super/state)
- Trigger: Admin submits credentials
- Basic Flow: Authenticate → issue session → redirect to dashboard
- Alternate: Invalid credentials → error message

Use Case UC-2: Create Election
- Actors: Admin
- Basic Flow: Provide details → validate time window → save to DB → success message
- Constraints: State-admin limited to their state

Use Case UC-3: Import Voters
- Actors: Admin
- Basic Flow: Upload CSV/XLSX → validate columns → parse (pandas) → upsert → report counts/errors
- Errors: Invalid format, missing columns, invalid Aadhaar/ID

Use Case UC-4: Cast Vote
- Actors: Voter
- Basic Flow: Authenticate → list elections → choose candidate → submit vote → record DB + blockchain → show receipt
- Constraints: One vote per election; time window enforced

Use Case UC-5: View Dashboard & Analytics
- Actors: Admin
- Basic Flow: Load metrics → fetch votes/elections/voters → render charts

Use Case UC-6: Audit Log
- Actors: Admin
- Basic Flow: Log significant actions → view logs (future UI)

## 9. Performance Requirements
- Server shall handle at least 100 requests/second under moderate load on a standard VM when backed by Supabase (scalable by horizontal replication and connection pooling).
- Vote submission shall complete within 1 second p95 during nominal operation.

## 10. Security and Privacy Requirements
- Encrypt all data in transit via HTTPS; rely on Supabase encryption at rest.
- Enforce least-privilege DB access; configure RLS for tables with PII.
- Hash or anonymize voter tokens in vote records; never store raw credentials in logs.
- Implement audit logging for admin actions and suspicious activities.
- Add rate limiting and CAPTCHA for authentication (future hardening).
- Replace demo OTP with real provider integration before production.

## 11. Other Requirements
- Internationalization shall cover major Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Sanskrit, etc.).
- Theme manager shall persist user preference across sessions.
- Provide sample voter import templates and export endpoints.

## 12. Appendices

### 12.1 Glossary
- Candidate: A person contesting in an election.
- Election: A voting event with candidates and timeframe.
- Turnout: Percentage of registered voters who cast votes.

### 12.2 References
- Supabase: https://supabase.com/
- FastAPI: https://fastapi.tiangolo.com/
- Chart.js: https://www.chartjs.org/

### 12.3 Environment & Configuration
- SUPABASE_URL, SUPABASE_KEY via .env or environment variables.
- Optional: RLS policy script `fix_sessions_rls.sql` for sessions table in development.

---

Document Owner: Project Maintainer – SecureVoteChain
Version: 1.0
Last Updated: 2025-10-30
