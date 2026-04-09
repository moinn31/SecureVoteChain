let sessionToken = null;
let voterToken = null;
let voterId = null;
let voterState = null;
let votedElections = new Set(); // Track elections where user has voted

function getVotedElectionsStorageKey() {
    return voterId ? `votedElections_${voterId}` : 'votedElections';
}

function normalizeImageSrc(value) {
    if (typeof value !== 'string') return null;

    const src = value.trim();
    if (!src) return null;

    if (src.startsWith('data:image/')) return src;
    if (src.startsWith('https://') || src.startsWith('http://')) return src;
    if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return src;

    return null;
}

function getInitials(text) {
    if (!text || typeof text !== 'string') return '?';

    const cleaned = text.trim().replace(/\s+/g, ' ');
    if (!cleaned) return '?';

    const words = cleaned.split(' ');
    const initials = words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    return initials || '?';
}

function createFallbackImage(label, background, foreground, shape = 'circle') {
    const initials = getInitials(label);
    const radius = shape === 'circle' ? '50%' : '16%';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${background}" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.14" />
                </linearGradient>
            </defs>
            <rect width="160" height="160" rx="${radius}" fill="url(#g)" />
            <circle cx="80" cy="80" r="64" fill="rgba(255,255,255,0.18)" />
            <text x="80" y="96" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="${foreground}">${initials}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function loadVotedElectionsFromStorage() {
    try {
        const stored = localStorage.getItem(getVotedElectionsStorageKey());
        const parsed = stored ? JSON.parse(stored) : [];
        votedElections = new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
        votedElections = new Set();
    }
}

function saveVotedElectionsToStorage() {
    try {
        localStorage.setItem(getVotedElectionsStorageKey(), JSON.stringify(Array.from(votedElections)));
    } catch (error) {
        console.warn('Could not persist voted elections:', error);
    }
}

function markElectionAsVotedInUI(electionId) {
    const card = document.querySelector(`.election-card[data-election-id="${electionId}"]`);
    if (!card) return;

    card.classList.add('voted');

    const statusBadge = card.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.textContent = "✓ You've Voted";
        statusBadge.className = 'status-badge completed';
    }

    card.querySelectorAll('input[type="radio"]').forEach(input => {
        input.disabled = true;
    });

    const voteButton = card.querySelector('button[onclick^="castVote"]');
    if (voteButton) {
        voteButton.disabled = true;
        voteButton.textContent = '🔒 Already Voted';
        voteButton.style.opacity = '0.75';
        voteButton.style.cursor = 'not-allowed';
    }
}

// Check if this page should be protected (admin trying to access voter page)
// DISABLED FOR DEVELOPMENT MODE
function checkPageAccess() {
    // Development mode - allow anyone to access voter portal
    return;
    
    /* PRODUCTION CODE - UNCOMMENT WHEN DEPLOYING:
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
        // Admin is logged in, redirect to admin page
        if (confirm('⚠️ ACCESS DENIED\n\nYou are logged in as an ADMIN.\n\nThis is the VOTER portal. Admins cannot access voter functions.\n\nClick OK to return to the Admin Dashboard.')) {
            window.location.href = '/admin';
        } else {
            window.location.href = '/';
        }
    }
    */
}

// Restore session from localStorage on page load
function restoreSession() {
    const storedVoterToken = localStorage.getItem('voterToken');
    const storedSessionToken = localStorage.getItem('voterSessionToken');
    const storedVoterId = localStorage.getItem('voterId');
    const storedVoterState = localStorage.getItem('voterState');
    const storedVoterName = localStorage.getItem('voterName');
    
    console.log('Attempting to restore voter session...', {
        hasToken: !!storedVoterToken,
        hasSessionToken: !!storedSessionToken,
        hasVoterId: !!storedVoterId
    });
    
    if (storedVoterToken && storedSessionToken && storedVoterId) {
        voterToken = storedVoterToken;
        sessionToken = storedSessionToken;
        voterId = storedVoterId;
        voterState = storedVoterState;
        loadVotedElectionsFromStorage();
        
        // Restore UI state with null checks
        const voterNameEl = document.getElementById('voterName');
        const displayVoterNameEl = document.getElementById('displayVoterName');
        const displayVoterStateEl = document.getElementById('displayVoterState');
        const displayVoterIdEl = document.getElementById('displayVoterId');
        const displayVoterTokenEl = document.getElementById('displayVoterToken');
        
        if (voterNameEl && storedVoterName) {
            voterNameEl.textContent = storedVoterName;
        }
        if (displayVoterNameEl && storedVoterName) {
            displayVoterNameEl.textContent = storedVoterName;
        }
        if (displayVoterStateEl && storedVoterState) {
            displayVoterStateEl.textContent = storedVoterState;
        }
        if (displayVoterIdEl && storedVoterId) {
            displayVoterIdEl.textContent = storedVoterId;
        }
        if (displayVoterTokenEl && storedVoterToken) {
            displayVoterTokenEl.textContent = storedVoterToken;
        }
        
        // Show dashboard, hide login
        const authSection = document.getElementById('authSection');
        const voterDashboard = document.getElementById('voterDashboard');
        
        if (authSection) {
            authSection.style.display = 'none';
        }
        if (voterDashboard) {
            voterDashboard.style.display = 'block';
        }
        
        // Load elections
        loadElections();
        
        console.log('Voter session restored successfully');
    } else {
        console.log('No valid voter session found in localStorage');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check access before initializing page
    checkPageAccess();
    
    // Restore session if exists
    restoreSession();
    
    // Apply translations immediately
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const requestOtpBtn = document.getElementById('requestOtpBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const verifyForm = document.getElementById('verifyForm');
    
    // Load states for dropdown
    loadStates();
    
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
    requestOtpBtn.addEventListener('click', requestOtp);
    logoutBtn.addEventListener('click', handleLogout);
    verifyForm.addEventListener('submit', handleVerifyVote);
    
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchAuthTab(this.dataset.tab);
        });
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
});

async function loadStates() {
    try {
        const response = await fetch('/api/states');
        const data = await response.json();
        
        const stateDropdown = document.getElementById('voterState');
        data.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading states:', error);
    }
}

async function requestOtp() {
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const fullNameReg = document.getElementById('fullNameReg').value;
    
    if (!fullNameReg) {
        showMessage('Full name is required', 'error');
        return;
    }
    if (aadhaarNumber.length !== 12) {
        showMessage('Aadhaar number must be 12 digits', 'error');
        return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
        showMessage('Valid mobile number is required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/request-otp-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar_number: aadhaarNumber, phone: mobileNumber, name: fullNameReg })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('otpSection').style.display = 'block';
            const masked = data.phone_masked || data.email_masked || '***';
            const medium = data.phone_masked ? 'SMS' : 'email';
            document.getElementById('otpDisplay').textContent = `OTP sent to ${masked} via ${medium}.`;
            showMessage(data.message, 'success');
        } else {
            showMessage(data.detail || 'Failed to request OTP', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const otp = document.getElementById('otpInput').value;
    const state = document.getElementById('voterState').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const fullNameReg = document.getElementById('fullNameReg').value;
    
    if (!otp || otp.length !== 6) {
        showMessage('Please enter the 6-digit OTP sent to your phone', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/voter/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aadhaar_number: aadhaarNumber,
                otp: otp,
                state: state,
                phone: mobileNumber,
                name: fullNameReg
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(data.message || 'Login successful!', 'success');
            
            voterId = data.voter_id;
            voterToken = data.voter_token;
            voterState = data.state;
            sessionToken = data.session_token;
            loadVotedElectionsFromStorage();
            
            // Save to localStorage for session persistence
            localStorage.setItem('voterToken', data.voter_token);
            localStorage.setItem('voterSessionToken', data.session_token);
            localStorage.setItem('voterId', data.voter_id);
            localStorage.setItem('voterState', data.state);
            localStorage.setItem('voterName', data.name);
            localStorage.setItem('voterSessionToken', data.session_token);
            voterId = data.voter_id;
            voterToken = data.voter_token;
            voterState = data.state;
            sessionToken = data.session_token;
            
            setTimeout(() => {
                alert(`Registration Successful!\n\nYour State: ${data.state}\nYour Voter ID: ${data.voter_id}\nYour Name: ${data.name}\n\n✅ You are now logged in!`);
                
                // Reset registration form
                document.getElementById('registerForm').reset();
                document.getElementById('otpSection').style.display = 'none';
                
                // Update UI for dashboard
                document.getElementById('voterName').textContent = data.name;
                document.getElementById('displayVoterName').textContent = data.name;
                document.getElementById('displayVoterState').textContent = data.state;
                document.getElementById('displayVoterId').textContent = data.voter_id;
                document.getElementById('displayVoterToken').textContent = data.voter_token;
                
                // Switch to dashboard
                document.getElementById('authSection').style.display = 'none';
                document.getElementById('voterDashboard').style.display = 'block';
                
                showMessage(`Welcome ${data.name}! You are now logged in.`, 'success');
                loadElections();
            }, 1000);
        } else {
            showMessage(data.detail || 'OTP verification failed', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const voterIdInput = document.getElementById('voterId').value;
    
    try {
        const response = await fetch('/api/voter/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voter_id: voterIdInput })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionToken = data.session_token;
            voterId = data.voter_id;
            voterToken = data.voter_token;
            voterState = data.state;
            
            // Save to localStorage for session persistence
            localStorage.setItem('voterToken', data.voter_token);
            localStorage.setItem('voterSessionToken', data.session_token);
            localStorage.setItem('voterId', data.voter_id);
            localStorage.setItem('voterState', data.state);
            localStorage.setItem('voterName', data.name);
            loadVotedElectionsFromStorage();
            
            document.getElementById('voterName').textContent = data.name;
            document.getElementById('displayVoterName').textContent = data.name;
            document.getElementById('displayVoterState').textContent = data.state;
            document.getElementById('displayVoterId').textContent = data.voter_id;
            document.getElementById('displayVoterToken').textContent = data.voter_token;
            
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('voterDashboard').style.display = 'block';
            
            showMessage('Login successful!', 'success');
            loadElections();
        } else {
            showMessage(data.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

function handleLogout() {
    sessionToken = null;
    voterId = null;
    voterToken = null;
    voterState = null;
    votedElections.clear(); // Clear voted elections tracking
    const votedElectionsKey = getVotedElectionsStorageKey();
    
    // Clear localStorage
    localStorage.removeItem('voterToken');
    localStorage.removeItem('voterSessionToken');
    localStorage.removeItem('voterId');
    localStorage.removeItem('voterState');
    localStorage.removeItem('voterName');
    localStorage.removeItem(votedElectionsKey);
    
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('voterDashboard').style.display = 'none';
    document.getElementById('registerForm').reset();
    document.getElementById('loginForm').reset();
}

async function loadElections() {
    try {
        const response = await fetch('/api/elections', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        const data = await response.json();
        const elections = data.elections || [];
        
        const electionsList = document.getElementById('electionsList');
        
        if (elections.length === 0) {
            electionsList.innerHTML = `
                <div class="info-box">
                    <p><strong>No elections available for ${voterState || 'your state'}</strong></p>
                    <p>Check back later for upcoming elections in your state.</p>
                </div>
            `;
            return;
        }
        
        electionsList.innerHTML = '';

        const activeElections = elections.filter(election => election.status === 'active');

        // Check vote status in parallel for faster page rendering.
        const voteStatusEntries = await Promise.all(
            activeElections.map(async (election) => {
                const hasVoted = await checkIfVoted(election.id);
                return [election.id, hasVoted];
            })
        );
        const hasVotedByElectionId = Object.fromEntries(voteStatusEntries);
        
        // Render active elections list
        for (const election of activeElections) {
                // Log election ID for debugging
                console.log('Election ID:', election.id, 'Title:', election.title);
                
                const hasVoted = hasVotedByElectionId[election.id] === true;
                
                const card = document.createElement('div');
                card.className = 'election-card';
                card.dataset.electionId = election.id;
                
                if (hasVoted) {
                    // Already voted - show disabled state with results button
                    card.classList.add('voted');
                    card.innerHTML = `
                        <h4>${election.title}</h4>
                        <span class="status-badge completed">✓ You've Voted</span>
                        <p><strong>State:</strong> ${election.state}</p>
                        <p>${election.description}</p>
                        <p><strong>End Time:</strong> ${new Date(election.end_time).toLocaleString()}</p>
                        <div class="success-box" style="margin-top: 20px;">
                            <p style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 2rem;">✓</span>
                                <span>
                                    <strong>Vote Successfully Cast!</strong><br>
                                    <small style="font-weight: 400;">You have already cast your vote in this election. Each voter can only vote once per election to maintain election integrity and prevent fraud.</small>
                                </span>
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-primary" onclick="showVoterElectionChart('${election.id}', '${election.title}', '${election.status}')" style="flex: 1;">
                                📊 View Live Results
                            </button>
                            <button class="btn btn-secondary" style="opacity: 0.7; cursor: not-allowed;" disabled>
                                🔒 Already Voted
                            </button>
                        </div>
                    `;
                } else {
                    // Not voted yet - show voting interface with results button
                    card.innerHTML = `
                        <h4>${election.title}</h4>
                        <span class="status-badge active">Active - Vote Now</span>
                        <p><strong>State:</strong> <span style="color: #FF9933; font-weight: 600;">${election.state}</span></p>
                        <p>${election.description}</p>
                        <p><strong>End Time:</strong> ${new Date(election.end_time).toLocaleString()}</p>
                        
                        <div style="margin: 15px 0;">
                            <button class="btn btn-secondary" onclick="showVoterElectionChart('${election.id}', '${election.title}', '${election.status}')" style="padding: 10px 20px; font-size: 14px;">
                                📊 View Current Results
                            </button>
                        </div>
                        
                        <h5 style="margin-top: 20px; color: #000080; font-weight: 600;">Select Your Candidate:</h5>
                        <div class="candidates-list" id="candidates-${election.id}">
                            ${election.candidates.map(c => {
                                // Display BOTH candidate photo AND party logo
                                let candidateImages = '';
                                const candidatePhoto = normalizeImageSrc(
                                    c.photo || c.photo_url || c.image || c.candidate_photo
                                ) || createFallbackImage(c.name || 'Candidate', '#FF9933', '#ffffff', 'circle');
                                const partyLogo = normalizeImageSrc(
                                    c.logo || c.logo_url || c.party_logo || c.symbol
                                ) || createFallbackImage(c.party || 'Party', '#0f6b4f', '#ffffff', 'rounded');
                                
                                // Show candidate photo if available
                                if (candidatePhoto) {
                                    candidateImages += `<img src="${candidatePhoto}" alt="${c.name}" title="${c.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 50%; border: 3px solid #FF9933; margin-right: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">`;
                                } else {
                                    // Default user icon if no photo
                                    candidateImages += `<div style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #ddd; margin-right: 12px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; font-size: 36px;">👤</div>`;
                                }
                                
                                // Show party logo if available
                                if (partyLogo) {
                                    candidateImages += `<img src="${partyLogo}" alt="${c.party}" title="${c.party} Logo" style="width: 70px; height: 70px; object-fit: contain; border-radius: 8px; border: 2px solid #ddd; margin-right: 12px; padding: 6px; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">`;
                                } else {
                                    // Default party icon if no logo
                                    candidateImages += `<div style="width: 70px; height: 70px; border-radius: 8px; border: 2px solid #ddd; margin-right: 12px; display: flex; align-items: center; justify-content: center; background: white; font-size: 36px;">🏛️</div>`;
                                }
                                
                                return `
                                <div class="candidate-item" onclick="selectCandidate('${election.id}', '${c.id}', this)" style="display: flex; align-items: center; padding: 18px; border: 2px solid #ddd; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s; background: white;">
                                    <input type="radio" name="candidate-${election.id}" value="${c.id}" style="margin-right: 15px; width: 20px; height: 20px; cursor: pointer;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        ${candidateImages}
                                    </div>
                                    <div style="flex: 1;">
                                        <strong style="font-size: 18px; color: #2c3e50; display: block; margin-bottom: 4px;">${c.name}</strong>
                                        <span style="color: #7f8c8d; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                            <span style="color: #FF9933;">●</span> ${c.party}
                                        </span>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                        <button class="btn btn-primary" onclick="castVote('${election.id}')" style="margin-top: 15px;">
                            🗳️ Cast Your Vote
                        </button>
                    `;
                }
                electionsList.appendChild(card);
        }
        
        if (electionsList.innerHTML === '') {
            electionsList.innerHTML = '<p>No active elections available.</p>';
        }
        
        // Start countdown timer for active elections
        startElectionCountdown(elections);
    } catch (error) {
        showMessage('Error loading elections', 'error');
    }
}

// Countdown Timer Function
let countdownInterval = null;

function startElectionCountdown(elections) {
    const countdownDisplay = document.getElementById('countdownDisplay');
    const countdownTimer = document.getElementById('countdownTimer');
    const countdownElectionName = document.getElementById('countdownElectionName');
    
    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Find the first active election for this voter's state
    const activeElection = elections.find(e => e.status === 'active' && e.state === voterState);
    
    if (!activeElection) {
        countdownDisplay.style.display = 'none';
        return;
    }
    
    const endTime = new Date(activeElection.end_time).getTime();
    countdownDisplay.style.display = 'block';
    countdownElectionName.textContent = activeElection.title;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endTime - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownTimer.textContent = 'ELECTION ENDED';
            countdownDisplay.style.background = 'linear-gradient(135deg, #7f8c8d, #95a5a6)';
            // Reload elections after a short delay
            setTimeout(() => loadElections(), 3000);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        let timeString = '';
        if (days > 0) {
            timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (hours > 0) {
            timeString = `${hours}h ${minutes}m ${seconds}s`;
        } else {
            timeString = `${minutes}m ${seconds}s`;
            // Change color to red when less than 1 hour remaining
            countdownDisplay.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        }
        
        countdownTimer.textContent = timeString;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

async function checkIfVoted(electionId) {
    // Check if we've already tracked this vote in current session
    if (votedElections.has(electionId)) {
        return true;
    }
    
    // Check with backend if this voter has already voted
    try {
        const response = await fetch(`/api/vote-status/${electionId}`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.has_voted) {
                votedElections.add(electionId);
                saveVotedElectionsToStorage();
                return true;
            }
        }
    } catch (error) {
        console.error('Error checking vote status:', error);
    }
    
    return false;
}

function selectCandidate(electionId, candidateId, element) {
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
    
    document.querySelectorAll(`#candidates-${electionId} .candidate-item`).forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
}

async function castVote(electionId) {
    const selectedCandidate = document.querySelector(`input[name="candidate-${electionId}"]:checked`);
    
    if (!selectedCandidate) {
        showMessage('Please select a candidate', 'error');
        return;
    }
    
    const candidateId = selectedCandidate.value;
    
    // Get candidate name for confirmation
    const candidateElement = document.querySelector(`input[name="candidate-${electionId}"]:checked`).closest('.candidate-item');
    const candidateName = candidateElement.querySelector('strong').textContent;
    
    if (!confirm(`Are you sure you want to vote for ${candidateName}?\n\nThis action is final and cannot be changed.`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                election_id: electionId,
                candidate_id: candidateId,
                voter_token: voterToken
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Mark this election as voted
            votedElections.add(electionId);
            saveVotedElectionsToStorage();
            markElectionAsVotedInUI(electionId);
            localStorage.setItem('voteUpdatedAt', String(Date.now()));
            
            showMessage('✓ Vote cast successfully and recorded on blockchain!', 'success');
            
            // Get election details
            const electionsResponse = await fetch('/api/elections', {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
            const electionsData = await electionsResponse.json();
            const election = electionsData.elections.find(e => e.id === electionId);
            
            // Show digital receipt modal
            setTimeout(() => {
                showReceiptModal({
                    electionTitle: election ? election.title : 'Unknown Election',
                    candidateName: candidateName,
                    voterID: voterId,
                    transactionHash: data.transaction_hash,
                    timestamp: new Date().toLocaleString()
                });
                
                // Reload elections to show updated state
                loadElections();
            }, 500);
        } else {
            if (data.detail && data.detail.includes('already voted')) {
                showMessage('⚠️ You have already voted in this election', 'error');
                votedElections.add(electionId);
                markElectionAsVotedInUI(electionId);
                saveVotedElectionsToStorage();
                localStorage.setItem('voteUpdatedAt', String(Date.now()));
                loadElections(); // Reload to show updated state
            } else {
                showMessage(data.detail || 'Failed to cast vote', 'error');
            }
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

async function handleVerifyVote(e) {
    e.preventDefault();
    
    const transactionHash = document.getElementById('transactionHash').value;
    
    try {
        const response = await fetch('/api/verify-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_hash: transactionHash })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('verificationResult');
            resultDiv.innerHTML = `
                <div class="verification-result">
                    <h4>✓ Vote Verified on Blockchain</h4>
                    <p><strong>Block Index:</strong> ${data.block.index}</p>
                    <p><strong>Block Hash:</strong> ${data.block.hash}</p>
                    <p><strong>Previous Hash:</strong> ${data.block.previous_hash}</p>
                    <p><strong>Timestamp:</strong> ${new Date(data.block.timestamp * 1000).toLocaleString()}</p>
                    <p><strong>Election ID:</strong> ${data.block.data.election_id}</p>
                    <p><strong>Vote Type:</strong> ${data.block.data.type}</p>
                    <p>${data.message}</p>
                </div>
            `;
            showMessage('Vote verified successfully!', 'success');
        } else {
            showMessage(data.detail || 'Verification failed', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
    }
}

function switchAuthTab(tabName) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.auth-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'vote') {
        loadElections();
    }
}

window.addEventListener('storage', (event) => {
    if (event.key === 'voteUpdatedAt') {
        loadElections();
    }
});

// Real-time Election Results Chart for Voters
let voterElectionChart = null;
let voterChartRefreshInterval = null;

function showVoterElectionChart(electionId, electionTitle, electionStatus) {
    // Create modal overlay
    const modalHTML = `
        <div id="voterChartModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="padding: 30px; border-bottom: 2px solid #e0e0e0; background: linear-gradient(135deg, #138808, #0a5a05); color: white; border-radius: 16px 16px 0 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px;">📊 ${electionTitle}</h2>
                            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">
                                ${electionStatus === 'active' ? '🔴 LIVE Results - Auto-refreshing every 5 seconds' : '📈 Final Results'}
                            </p>
                        </div>
                        <button onclick="closeVoterElectionChart()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
                            ✕ Close
                        </button>
                    </div>
                </div>
                <div style="padding: 30px;">
                    <div id="voterChartStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;"></div>
                    <canvas id="voterElectionResultsChart" style="max-height: 400px;"></canvas>
                    <div id="voterChartDetails" style="margin-top: 30px;"></div>
                    <div style="background: #fff3e0; border-left: 4px solid #FF9933; padding: 15px; margin-top: 20px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            🔐 <strong>Your vote is anonymous:</strong> These results show the current vote counts, but individual voter identity is protected by blockchain encryption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Load chart data
    loadVoterElectionChart(electionId, electionStatus);
    
    // Auto-refresh if election is active
    if (electionStatus === 'active') {
        voterChartRefreshInterval = setInterval(() => {
            loadVoterElectionChart(electionId, electionStatus);
        }, 5000); // Refresh every 5 seconds
    }
}

function closeVoterElectionChart() {
    // Clear refresh interval
    if (voterChartRefreshInterval) {
        clearInterval(voterChartRefreshInterval);
        voterChartRefreshInterval = null;
    }
    
    // Destroy chart
    if (voterElectionChart) {
        voterElectionChart.destroy();
        voterElectionChart = null;
    }
    
    // Remove modal
    const modal = document.getElementById('voterChartModal');
    if (modal) {
        modal.remove();
    }
}

async function loadVoterElectionChart(electionId, electionStatus) {
    try {
        const response = await fetch(`/api/elections/${electionId}/results`);
        
        if (response.ok) {
            const data = await response.json();
            displayVoterElectionChart(data, electionStatus);
        }
    } catch (error) {
        console.error('Error loading election chart:', error);
    }
}

function displayVoterElectionChart(data, electionStatus) {
    const candidates = [...(data.results || [])].sort((a, b) => {
        const voteDiff = (b.votes || 0) - (a.votes || 0);
        if (voteDiff !== 0) return voteDiff;
        return (a.name || '').localeCompare(b.name || '');
    });
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    
    // Update statistics
    const statsDiv = document.getElementById('voterChartStats');
    statsDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #FF9933, #FF6600); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${totalVotes}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Total Votes Cast</div>
        </div>
        <div style="background: linear-gradient(135deg, #138808, #0a5a05); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${candidates.length}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Candidates</div>
        </div>
        <div style="background: linear-gradient(135deg, #000080, #0000b3); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${electionStatus === 'active' ? 'LIVE' : 'ENDED'}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Status</div>
        </div>
    `;
    
    // Prepare chart data
    const labels = candidates.map(c => c.name);
    const votes = candidates.map(c => c.votes);
    
    // Calculate percentages
    const percentages = votes.map(v => totalVotes > 0 ? ((v / totalVotes) * 100).toFixed(2) : 0);
    
    // Generate colors
    const colors = [
        '#FF9933', '#138808', '#000080', '#FF6600',
        '#0a5a05', '#0000b3', '#cc7a29', '#0f6e06'
    ];
    
    // Destroy previous chart
    if (voterElectionChart) {
        voterElectionChart.destroy();
    }
    
    // Create new pie chart
    const ctx = document.getElementById('voterElectionResultsChart');
    voterElectionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: votes,
                backgroundColor: colors.slice(0, candidates.length),
                borderColor: '#fff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Poppins',
                            size: 14
                        },
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: electionStatus === 'active' ? '🔴 LIVE Vote Count' : 'Final Vote Distribution',
                    font: {
                        family: 'Poppins',
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} votes (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    });
    
    // Display detailed results
    const detailsDiv = document.getElementById('voterChartDetails');
    detailsDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">Detailed Breakdown:</h3>
        ${candidates.map((candidate, index) => {
            const percentage = percentages[index];
            const isLeading = index === 0 && votes[index] > 0;
            
            // Check if symbol is base64 image or emoji/text
            const symbolDisplay = candidate.symbol && candidate.symbol.startsWith('data:image') 
                ? `<img src="${candidate.symbol}" alt="${candidate.name}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; border: 1px solid #ddd; vertical-align: middle;">` 
                : `<span style="font-size: 24px; vertical-align: middle;">${candidate.symbol || '🗳️'}</span>`;
            
            return `
            <div style="background: ${isLeading ? '#f0f9f0' : '#f9f9f9'}; padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 4px solid ${colors[index]}; display: flex; justify-content: space-between; align-items: center; ${isLeading ? 'box-shadow: 0 2px 8px rgba(19, 136, 8, 0.2);' : ''}">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <strong style="font-size: 16px; color: #333;">${candidate.name}</strong>
                        ${isLeading && totalVotes > 0 ? '<span style="background: #138808; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">LEADING</span>' : ''}
                    </div>
                    <span style="color: #666; font-size: 14px;">${candidate.party} • ${symbolDisplay}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: ${colors[index]};">${candidate.votes}</div>
                    <div style="font-size: 14px; color: #666;">${percentage}%</div>
                </div>
            </div>
        `;
        }).join('')}
    `;
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;
    
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 4000);
}

// Digital Receipt Functions
let currentReceiptData = null;

function showReceiptModal(data) {
    currentReceiptData = data;
    
    // Fill in receipt details
    document.getElementById('receiptElection').textContent = data.electionTitle;
    document.getElementById('receiptCandidate').textContent = data.candidateName;
    document.getElementById('receiptVoterID').textContent = data.voterID;
    document.getElementById('receiptDateTime').textContent = data.timestamp;
    document.getElementById('receiptHash').textContent = data.transactionHash;
    
    // Generate QR Code
    const qrContainer = document.getElementById('receiptQR');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    new QRCode(qrContainer, {
        text: data.transactionHash,
        width: 200,
        height: 200,
        colorDark: "#000080",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show modal
    document.getElementById('receiptModal').style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receiptModal').style.display = 'none';
}

function copyHash() {
    if (currentReceiptData) {
        navigator.clipboard.writeText(currentReceiptData.transactionHash).then(() => {
            showMessage('Transaction hash copied to clipboard!', 'success');
        }).catch(err => {
            showMessage('Failed to copy hash', 'error');
        });
    }
}

function downloadReceipt() {
    if (!currentReceiptData) return;
    
    // Create a printable receipt
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vote Receipt - ${currentReceiptData.voterID}</title>
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    background: white;
                }
                .header {
                    text-align: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #FF9933, #FF6600);
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 32px;
                }
                .details {
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 10px;
                    border: 2px solid #000080;
                }
                .row {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px 0;
                    border-bottom: 1px dashed #ddd;
                }
                .label {
                    font-weight: bold;
                    color: #000080;
                }
                .value {
                    color: #2c3e50;
                }
                .hash {
                    word-break: break-all;
                    color: #FF6600;
                    font-size: 12px;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #7f8c8d;
                    font-size: 12px;
                    padding: 20px;
                    border-top: 2px solid #e0e0e0;
                }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎫 Vote Receipt</h1>
                <p>SecureVoteChain - Blockchain Voting System</p>
            </div>
            <div class="details">
                <div class="row">
                    <span class="label">Election:</span>
                    <span class="value">${currentReceiptData.electionTitle}</span>
                </div>
                <div class="row">
                    <span class="label">Candidate:</span>
                    <span class="value">${currentReceiptData.candidateName}</span>
                </div>
                <div class="row">
                    <span class="label">Voter ID:</span>
                    <span class="value">${currentReceiptData.voterID}</span>
                </div>
                <div class="row">
                    <span class="label">Date & Time:</span>
                    <span class="value">${currentReceiptData.timestamp}</span>
                </div>
                <div class="row">
                    <span class="label">Transaction Hash:</span>
                    <span class="value hash">${currentReceiptData.transactionHash}</span>
                </div>
            </div>
            <div class="footer">
                <p><strong>⚠️ IMPORTANT:</strong> Save this receipt for your records.</p>
                <p>You can verify your vote anytime using the transaction hash at:</p>
                <p><strong>${window.location.origin}/verify</strong></p>
                <p style="margin-top: 20px;">This vote is secured by blockchain technology and cannot be altered.</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 15px 40px; background: #FF9933; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    🖨️ Print Receipt
                </button>
            </div>
        </body>
        </html>
    `);
    receiptWindow.document.close();
}
