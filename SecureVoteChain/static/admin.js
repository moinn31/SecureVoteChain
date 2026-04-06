let sessionToken = null;
let adminState = null;
let adminRole = null;
let notifications = [];
let lastVoteCount = 0;
let notificationInterval = null;

console.log('Admin.js loaded successfully');

// Check if this page should be protected (voter trying to access admin page)
// DISABLED FOR DEVELOPMENT MODE
function checkPageAccess() {
    // Development mode - allow anyone to access admin panel
    return;
    
    /* PRODUCTION CODE - UNCOMMENT WHEN DEPLOYING:
    const storedToken = localStorage.getItem('voterToken');
    if (storedToken) {
        // Voter is logged in, redirect to voter page
        if (confirm('⚠️ ACCESS DENIED\n\nYou are logged in as a VOTER.\n\nThis is the ADMIN portal. Voters cannot access administrative functions.\n\nClick OK to return to the Voter Portal.')) {
            window.location.href = '/voter';
        } else {
            window.location.href = '/';
        }
    }
    */
}

// Restore admin session from localStorage
function restoreAdminSession() {
    const storedToken = localStorage.getItem('adminToken');
    const storedUsername = localStorage.getItem('adminUsername');
    const storedState = localStorage.getItem('adminState');
    const storedRole = localStorage.getItem('adminRole');
    
    console.log('Attempting to restore admin session...', {
        hasToken: !!storedToken,
        hasUsername: !!storedUsername,
        state: storedState,
        role: storedRole
    });
    
    if (storedToken && storedUsername) {
        sessionToken = storedToken;
        adminState = storedState;
        adminRole = storedRole;
        
        // Restore UI with null checks
        const adminNameEl = document.getElementById('adminName');
        const adminStateEl = document.getElementById('adminState');
        const adminRoleEl = document.getElementById('adminRole');
        
        if (adminNameEl) {
            adminNameEl.textContent = storedUsername;
        }
        if (adminStateEl) {
            adminStateEl.textContent = storedState || 'Unknown';
        }
        if (adminRoleEl) {
            adminRoleEl.textContent = storedRole === 'super_admin' ? 'Super Admin' : 'State Admin';
        }
        
        // Filter state dropdown based on admin's access
        const stateDropdown = document.getElementById('electionState');
        if (stateDropdown && storedState && storedState !== 'All States') {
            stateDropdown.value = storedState;
            stateDropdown.disabled = true;
        }
        
        // Show dashboard, hide login
        const loginScreen = document.getElementById('loginScreen');
        const dashboardLayout = document.getElementById('dashboardLayout');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (dashboardLayout) {
            dashboardLayout.style.display = 'block';
        }
        
        // Load initial data
        try {
            loadElections();
            loadVoters();
            loadStatistics();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
        
        console.log('Admin session restored from localStorage');
    } else {
        console.log('No valid admin session found in localStorage');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    
    // Check access before initializing page
    checkPageAccess();
    
    // Restore admin session if exists (this sets adminState)
    restoreAdminSession();
    
    const loginForm = document.getElementById('adminLoginForm');
    console.log('Login form element:', loginForm);
    
    const createElectionForm = document.getElementById('createElectionForm');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const verifyChainBtn = document.getElementById('verifyChainBtn');
    
    // Import Voters elements
    const selectFileBtn = document.getElementById('selectFileBtn');
    const voterFileInput = document.getElementById('voterFileInput');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    const clearFileBtn = document.getElementById('clearFileBtn');
    
    // Load states for dropdown (must be called after session restore)
    setTimeout(() => {
        loadStates();
    }, 100);
    
    if (loginForm) {
        console.log('Attaching login form handler');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
    
    if (createElectionForm) {
        console.log('Attaching create election form handler');
        createElectionForm.addEventListener('submit', handleCreateElection);
    } else {
        console.error('Create election form not found!');
    }
    
    if (addCandidateBtn) {
        addCandidateBtn.addEventListener('click', addCandidateRow);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (verifyChainBtn) {
        verifyChainBtn.addEventListener('click', verifyBlockchain);
    }
    
    // Import Voters event listeners
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => voterFileInput.click());
    }
    if (voterFileInput) {
        voterFileInput.addEventListener('change', handleFileSelect);
    }
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', handleFileUpload);
    }
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', downloadTemplate);
    }
    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', clearSelectedFile);
    }
    
    // Drag and drop support
    const dropZone = document.getElementById('uploadDropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#FF9933';
            dropZone.style.background = 'rgba(255, 153, 51, 0.05)';
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.background = 'white';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.background = 'white';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                voterFileInput.files = files;
                handleFileSelect();
            }
        });
    }
    
    // Audit log refresh button
    const refreshAuditBtn = document.getElementById('refreshAuditBtn');
    if (refreshAuditBtn) {
        refreshAuditBtn.addEventListener('click', loadAuditLogs);
    }
    
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
        
        const stateDropdown = document.getElementById('electionState');
        if (!stateDropdown) return;
        
        // Clear existing options except the first one
        stateDropdown.innerHTML = '<option value="">-- Select State --</option>';
        
        // If state admin (not super admin), pre-select and lock their state
        if (adminState && adminState !== 'All States') {
            const option = document.createElement('option');
            option.value = adminState;
            option.textContent = adminState;
            option.selected = true;
            stateDropdown.appendChild(option);
            stateDropdown.disabled = true;
            stateDropdown.style.background = '#f0f0f0';
            stateDropdown.style.cursor = 'not-allowed';
            console.log(`State admin detected: Locked to ${adminState}`);
        } else {
            // Super admin can select any state
            data.states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateDropdown.appendChild(option);
            });
            console.log('Super admin detected: All states available');
        }
    } catch (error) {
        console.error('Error loading states:', error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('Attempting login for user:', username);
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionToken = data.session_token;
            adminState = data.state;
            adminRole = data.role;
            
            // Save to localStorage for session persistence
            localStorage.setItem('adminToken', data.session_token);
            localStorage.setItem('adminUsername', data.username);
            localStorage.setItem('adminState', data.state);
            localStorage.setItem('adminRole', data.role);
            
            document.getElementById('adminName').textContent = data.username;
            document.getElementById('adminState').textContent = data.state;
            document.getElementById('adminRole').textContent = data.role === 'super_admin' ? 'Super Admin' : 'State Admin';
            
            // Reload states dropdown with correct permissions
            loadStates();
            
            // Show dashboard
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboardLayout').style.display = 'block';
            showMessage(`Welcome ${data.role === 'super_admin' ? 'Super Admin' : 'State Admin'}!`, 'success');
            
            // Log successful login
            await logAdminAction('login', `Admin logged in from ${data.state}`);
            
            // Load overview data on login
            loadDashboardStats();
            loadElections();
            loadBlockchain();
            
            // Start live notification polling
            startNotificationPolling();
            addNotification('✅', 'Login Successful', `Welcome back, ${data.username}!`);
        } else {
            showMessage(data.detail || 'Login failed', 'error');
            console.error('Login failed:', data);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error connecting to server: ' + error.message, 'error');
    }
}

function handleLogout() {
    // Log logout action before clearing session
    if (sessionToken) {
        logAdminAction('logout', 'Admin logged out');
    }
    
    // Stop notification polling
    stopNotificationPolling();
    clearNotifications();
    
    sessionToken = null;
    adminState = null;
    adminRole = null;
    lastVoteCount = 0;
    
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminState');
    localStorage.removeItem('adminRole');
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardLayout').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
    
    // Re-enable state dropdown
    const stateDropdown = document.getElementById('electionState');
    stateDropdown.disabled = false;
    stateDropdown.style.backgroundColor = '';
    stateDropdown.style.cursor = '';
}

function addCandidateRow() {
    const candidatesList = document.getElementById('candidatesList');
    const newRow = document.createElement('div');
    newRow.className = 'candidate-row';
    newRow.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 120px 120px 50px; gap: 12px; align-items: center; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;';
    newRow.innerHTML = `
        <input type="text" class="candidate-name" placeholder="Candidate Name *" required style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        <input type="text" class="candidate-party" placeholder="Party *" required style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        <label style="background: #3b82f6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s;">
            📷 Photo
            <input type="file" class="candidate-photo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidatePhoto(this)">
        </label>
        <label style="background: #8b5cf6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s;">
            🎨 Logo
            <input type="file" class="candidate-logo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidateLogo(this)">
        </label>
        <button type="button" class="remove-candidate-btn" onclick="this.parentElement.remove()" style="background: #dc2626; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: all 0.3s;">✕</button>
    `;
    candidatesList.appendChild(newRow);
}

// Preview candidate photo when selected
function previewCandidatePhoto(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ Photo size must be less than 5MB');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.match('image/(png|jpeg|jpg)')) {
            alert('⚠️ Please select a PNG or JPG image');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const label = input.parentElement;
            label.innerHTML = `✅ Photo <input type="file" class="candidate-photo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidatePhoto(this)">`;
            label.style.background = '#10b981';
            label.title = file.name;
        };
        reader.readAsDataURL(file);
    }
}

// Preview candidate logo when selected
function previewCandidateLogo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ Logo size must be less than 2MB');
            input.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.match('image/(png|jpeg|jpg)')) {
            alert('⚠️ Please select a PNG or JPG image');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const label = input.parentElement;
            label.innerHTML = `✅ Logo <input type="file" class="candidate-logo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidateLogo(this)">`;
            label.style.background = '#7c3aed';
            label.title = file.name;
        };
        reader.readAsDataURL(file);
    }
}

// Prevent removing first candidate
function removeFirstCandidate(button) {
    const candidatesList = document.getElementById('candidatesList');
    if (candidatesList.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('⚠️ At least one candidate is required');
    }
}

async function handleCreateElection(e) {
    e.preventDefault();
    
    console.log('Create election form submitted');
    
    const title = document.getElementById('electionTitle').value;
    const description = document.getElementById('electionDescription').value;
    const state = document.getElementById('electionState').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    console.log('Form values:', { title, description, state, startTime, endTime });
    
    if (!state) {
        showMessage('Please select a state for the election', 'error');
        return;
    }
    
    const candidateRows = document.querySelectorAll('.candidate-row');
    const candidates = [];
    
    console.log('Found candidate rows:', candidateRows.length);
    
    // Process candidates with async file reading
    for (const row of candidateRows) {
        const name = row.querySelector('.candidate-name').value;
        const party = row.querySelector('.candidate-party').value;
        const photoInput = row.querySelector('.candidate-photo');
        const logoInput = row.querySelector('.candidate-logo');
        
        if (name && party) {
            let symbol = '🗳️'; // Default symbol
            let photo = null;
            let logo = null;
            
            // Read photo file if present
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];
                photo = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            
            // Read logo file if present
            if (logoInput && logoInput.files && logoInput.files[0]) {
                const file = logoInput.files[0];
                logo = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            
            // Use logo as symbol if available, otherwise use photo, otherwise use default emoji
            if (logo) {
                symbol = logo;
            } else if (photo) {
                symbol = photo;
            }
            
            candidates.push({
                id: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                party,
                symbol,
                photo: photo,
                logo: logo,
                description: `${name} from ${party}`
            });
        }
    }
    
    console.log('Processed candidates:', candidates.length);
    
    if (candidates.length === 0) {
        showMessage('Please add at least one candidate', 'error');
        return;
    }
    
    // Warn if any candidates are missing photos or logos
    const missingMedia = candidates.filter(c => !c.photo && !c.logo);
    if (missingMedia.length > 0) {
        const proceed = confirm(`⚠️ Warning: ${missingMedia.length} candidate(s) don't have photos or logos.\n\nCandidate names: ${missingMedia.map(c => c.name).join(', ')}\n\nDo you want to proceed anyway?`);
        if (!proceed) {
            return;
        }
    }
    
    try {
        const response = await fetch('/api/admin/elections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                title,
                description,
                state,
                start_time: startTime,
                end_time: endTime,
                candidates
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(`Election created successfully for ${state}!`, 'success');
            
            // Log this action
            await logAdminAction('election_created', `Created election "${title}" for ${state}`);
            
            document.getElementById('createElectionForm').reset();
            
            // Reset state dropdown if super admin
            if (adminState === 'All States') {
                document.getElementById('electionState').value = '';
            }
            
            // Reset candidates list with new layout
            document.getElementById('candidatesList').innerHTML = `
                <div class="candidate-row" style="display: grid; grid-template-columns: 1fr 1fr 120px 120px 50px; gap: 12px; align-items: center; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
                    <input type="text" class="candidate-name" placeholder="Candidate Name *" required style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
                    <input type="text" class="candidate-party" placeholder="Party *" required style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
                    <label style="background: #3b82f6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s;">
                        📷 Photo
                        <input type="file" class="candidate-photo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidatePhoto(this)">
                    </label>
                    <label style="background: #8b5cf6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s;">
                        🎨 Logo
                        <input type="file" class="candidate-logo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidateLogo(this)">
                    </label>
                    <button type="button" class="remove-candidate-btn" onclick="removeFirstCandidate(this)" style="background: #e5e7eb; color: #9ca3af; padding: 10px; border: none; border-radius: 6px; cursor: not-allowed; font-size: 16px;" disabled title="First candidate cannot be removed">✕</button>
                </div>
            `;
            loadElections();
        } else {
            showMessage(data.detail || 'Failed to create election', 'error');
        }
    } catch (error) {
        console.error('Create election error:', error);
        showMessage('Error connecting to server', 'error');
    }
}

async function loadElections() {
    try {
        const response = await fetch('/api/elections', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        const data = await response.json();
        
        const electionsList = document.getElementById('electionsList');
        
        if (!data.elections || data.elections.length === 0) {
            electionsList.innerHTML = `
                <div class="info-box">
                    <p><strong>No elections found for ${adminState || 'your jurisdiction'}</strong></p>
                    <p>Create a new election to get started.</p>
                </div>
            `;
            return;
        }
        
        if (data.elections.length === 0) {
            electionsList.innerHTML = '<p>No elections created yet.</p>';
            return;
        }
        
        electionsList.innerHTML = '';
        
        for (const election of data.elections) {
            // Fetch results with error handling
            let resultsData = { results: [], total_votes: 0 };
            try {
                const resultsResponse = await fetch(`/api/elections/${election.id}/results`);
                if (resultsResponse.ok) {
                    resultsData = await resultsResponse.json();
                } else {
                    console.warn(`Failed to load results for election ${election.id}`);
                }
            } catch (error) {
                console.error(`Error fetching results for election ${election.id}:`, error);
            }
            
            const card = document.createElement('div');
            card.className = 'election-card';
            card.innerHTML = `
                <h4>${election.title}</h4>
                <span class="status-badge ${election.status}">${election.status}</span>
                <p><strong>State:</strong> <span style="color: #FF9933; font-weight: 600;">${election.state || 'Not specified'}</span></p>
                <p>${election.description}</p>
                <p><strong>Start:</strong> ${new Date(election.start_time).toLocaleString()}</p>
                <p><strong>End:</strong> ${new Date(election.end_time).toLocaleString()}</p>
                
                <div style="margin: 20px 0; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="showElectionChart('${election.id}', '${election.title}', '${election.status}')" style="padding: 10px 20px; font-size: 14px; flex: 1; min-width: 180px;">
                        📊 View Live Results Chart
                    </button>
                    <button class="btn btn-secondary" onclick="exportResults('${election.id}', 'json')" style="padding: 10px 20px; font-size: 14px;">
                        📥 Export JSON
                    </button>
                    <button class="btn btn-secondary" onclick="exportResults('${election.id}', 'csv')" style="padding: 10px 20px; font-size: 14px;">
                        📊 Export CSV
                    </button>
                </div>
                
                <h5>Results Summary:</h5>
                <div class="results-grid">
                    ${resultsData.results && resultsData.results.length > 0 ? resultsData.results.map(r => {
                        // Check if symbol is a base64 image or emoji/text
                        const symbolDisplay = r.symbol && r.symbol.startsWith('data:image') 
                            ? `<img src="${r.symbol}" alt="${r.name}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #ddd;">` 
                            : `<span style="font-size: 32px;">${r.symbol || '🗳️'}</span>`;
                        
                        return `
                        <div class="result-item">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${symbolDisplay}
                                <div>
                                    <strong>${r.name}</strong> (${r.party})
                                    <br><small>${r.votes} votes</small>
                                </div>
                            </div>
                        </div>
                    `}).join('') : '<p style="text-align: center; color: #999;">No votes cast yet</p>'}
                </div>
                <p><strong>Total Votes:</strong> ${resultsData.total_votes || 0}</p>
            `;
            electionsList.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading elections:', error);
        showMessage('Error loading elections', 'error');
    }
}

// Load voters for admin's state
async function loadVoters() {
    try {
        const response = await fetch('/api/admin/voters', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load voters');
        }
        
        const data = await response.json();
        
        console.log(`Loaded ${data.total} voters for ${data.admin_state}`);
        
        // Update voter count in statistics
        const statTotalVoters = document.getElementById('statTotalVoters');
        if (statTotalVoters) {
            statTotalVoters.textContent = data.total;
        }
        
        return data.voters;
    } catch (error) {
        console.error('Error loading voters:', error);
        showMessage('Error loading voters', 'error');
        return [];
    }
}

// Load dashboard statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const data = await response.json();
        
        // Update statistics on dashboard
        const statTotalVoters = document.getElementById('statTotalVoters');
        const statActiveElections = document.getElementById('statActiveElections');
        const statTotalVotes = document.getElementById('statTotalVotes');
        
        if (statTotalVoters) {
            statTotalVoters.textContent = data.voters || 0;
        }
        if (statActiveElections) {
            statActiveElections.textContent = data.active_elections || 0;
        }
        if (statTotalVotes) {
            statTotalVotes.textContent = data.votes || 0;
        }
        
        console.log(`Statistics loaded for ${data.admin_state}: ${data.voters} voters, ${data.elections} elections`);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadBlockchain() {
    try {
        const response = await fetch('/api/blockchain');
        const data = await response.json();
        
        document.getElementById('totalBlocks').textContent = data.length;
        document.getElementById('chainStatus').textContent = data.is_valid ? 'Valid' : 'Invalid';
        document.getElementById('chainValidity').textContent = data.is_valid ? '✓ Verified' : '✗ Corrupted';
        
        const blockchainData = document.getElementById('blockchainData');
        blockchainData.innerHTML = '<h4>Recent Blocks</h4>';
        
        const recentBlocks = data.chain.slice(-10).reverse();
        
        recentBlocks.forEach(block => {
            const blockDiv = document.createElement('div');
            blockDiv.className = 'block-item';
            blockDiv.innerHTML = `
                <h5>Block #${block.index}</h5>
                <p><strong>Hash:</strong> <code>${block.hash}</code></p>
                <p><strong>Previous Hash:</strong> <code>${block.previous_hash}</code></p>
                <p><strong>Timestamp:</strong> ${new Date(block.timestamp * 1000).toLocaleString()}</p>
                <p><strong>Data:</strong></p>
                <pre>${JSON.stringify(block.data, null, 2)}</pre>
            `;
            blockchainData.appendChild(blockDiv);
        });
    } catch (error) {
        showMessage('Error loading blockchain', 'error');
    }
}

async function verifyBlockchain() {
    try {
        const response = await fetch('/api/blockchain/verify');
        const data = await response.json();
        
        if (data.is_valid) {
            showMessage(data.message, 'success');
        } else {
            showMessage(data.message, 'error');
        }
        
        loadBlockchain();
    } catch (error) {
        showMessage('Error verifying blockchain', 'error');
    }
}

// Load dashboard overview statistics
async function loadDashboardStats() {
    try {
        // Fetch elections
        const electionsResponse = await fetch('/api/elections', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (electionsResponse.ok) {
            const electionsData = await electionsResponse.json();
            const elections = electionsData.elections;
            
            // Count total and active elections
            const totalElections = elections.length;
            const activeElections = elections.filter(e => e.status === 'active').length;
            
            document.getElementById('statTotalElections').textContent = totalElections;
            document.getElementById('statActiveElections').textContent = activeElections;
            
            // Display recent elections
            const recentElectionsList = document.getElementById('recentElectionsList');
            if (recentElectionsList) {
                const recentElections = elections.slice(0, 5);
                
                if (recentElections.length === 0) {
                    recentElectionsList.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 20px;">No elections created yet</p>';
                } else {
                    recentElectionsList.innerHTML = recentElections.map(election => `
                        <div class="election-card ${election.status}">
                            <h4>${election.title}</h4>
                            <p>📍 ${election.state}</p>
                            <p>🗓️ ${new Date(election.start_time).toLocaleString()}</p>
                            <span class="election-badge ${election.status}">${election.status.toUpperCase()}</span>
                        </div>
                    `).join('');
                }
            }
        }
        
        // Fetch votes count
        const votesResponse = await fetch('/api/votes', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (votesResponse.ok) {
            const votesData = await votesResponse.json();
            document.getElementById('statTotalVotes').textContent = votesData.votes ? votesData.votes.length : 0;
        }
        
        // Fetch voters count
        const votersResponse = await fetch('/api/voters', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (votersResponse.ok) {
            const votersData = await votersResponse.json();
            const voters = votersData.voters || [];
            
            // Filter by state if state admin
            let voterCount = voters.length;
            if (adminState && adminState !== 'All States') {
                voterCount = voters.filter(v => v.state === adminState).length;
            }
            
            document.getElementById('statTotalVoters').textContent = voterCount;
        }
        
        // Fetch blockchain info
        const blockchainResponse = await fetch('/api/blockchain');
        
        if (blockchainResponse.ok) {
            const blockchainData = await blockchainResponse.json();
            document.getElementById('statBlockchainBlocks').textContent = blockchainData.chain.length;
            
            const isValid = blockchainData.chain.every((block, index) => {
                if (index === 0) return true; // Genesis block
                return block.previous_hash === blockchainData.chain[index - 1].hash;
            });
            
            document.getElementById('statChainStatus').textContent = isValid ? 'Verified ✓' : 'Invalid ✗';
            document.getElementById('statChainStatus').style.color = isValid ? '#27ae60' : '#e74c3c';
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
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
    
    if (tabName === 'elections') {
        loadElections();
    } else if (tabName === 'blockchain') {
        loadBlockchain();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    } else if (tabName === 'audit') {
        loadAuditLogs();
    }
}

// Analytics Functions
let turnoutChart = null;

async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics/voter-turnout', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayTurnoutAnalytics(data.statistics);
        } else {
            showMessage('Failed to load analytics', 'error');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showMessage('Error loading analytics', 'error');
    }
}

function displayTurnoutAnalytics(statistics) {
    const states = Object.keys(statistics);
    const turnoutData = states.map(state => statistics[state].turnout_percentage);
    const totalVoters = states.map(state => statistics[state].total_voters);
    const votedCounts = states.map(state => statistics[state].voted_count);
    
    // Destroy previous chart if exists
    if (turnoutChart) {
        turnoutChart.destroy();
    }
    
    // Create bar chart
    const ctx = document.getElementById('turnoutChart');
    turnoutChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: states,
            datasets: [{
                label: 'Voter Turnout %',
                data: turnoutData,
                backgroundColor: 'rgba(255, 153, 51, 0.7)',
                borderColor: '#FF9933',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Voter Turnout by State',
                    font: { size: 18, family: 'Poppins' }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Display detailed statistics
    const detailsDiv = document.getElementById('analyticsDetails');
    detailsDiv.innerHTML = states.map((state, index) => `
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #FF9933;">
            <h4 style="margin: 0 0 15px 0; color: #FF9933; font-size: 18px;">${state}</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Total Registered:</span>
                    <span style="font-weight: 600; color: #000080;">${totalVoters[index]}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Voted:</span>
                    <span style="font-weight: 600; color: #138808;">${votedCounts[index]}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                    <span style="color: #666; font-weight: 600;">Turnout:</span>
                    <span style="font-weight: 700; color: #FF9933; font-size: 20px;">${turnoutData[index]}%</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Audit Log Functions
async function loadAuditLogs() {
    try {
        const response = await fetch('/api/audit-logs?limit=50', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAuditLogs(data.logs);
        } else {
            showMessage('Failed to load audit logs', 'error');
        }
    } catch (error) {
        console.error('Error loading audit logs:', error);
        showMessage('Error loading audit logs', 'error');
    }
}

function displayAuditLogs(logs) {
    const logsDiv = document.getElementById('auditLogsList');
    
    if (logs.length === 0) {
        logsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No audit logs found</p>';
        return;
    }
    
    logsDiv.innerHTML = logs.map(log => {
        const date = new Date(log.timestamp);
        const timeStr = date.toLocaleString();
        
        const actionTypeColors = {
            'election_created': '#138808',
            'election_deleted': '#d32f2f',
            'election_updated': '#FF9933',
            'login': '#000080',
            'logout': '#666'
        };
        
        const actionColor = actionTypeColors[log.action_type] || '#666';
        
        return `
            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${actionColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: ${actionColor}; text-transform: uppercase; font-size: 12px;">${log.action_type}</strong>
                        <p style="margin: 5px 0; color: #333;">${log.action_details || 'No details'}</p>
                    </div>
                    <span style="color: #999; font-size: 12px; white-space: nowrap; margin-left: 15px;">${timeStr}</span>
                </div>
                <div style="display: flex; gap: 20px; font-size: 12px; color: #666;">
                    <span>👤 ${log.admin_username}</span>
                    <span>📍 ${log.admin_state}</span>
                    <span>🔒 ${log.admin_role}</span>
                    <span>🌐 ${log.ip_address}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Log admin actions
async function logAdminAction(actionType, details) {
    if (!sessionToken) return;
    
    try {
        await fetch('/api/audit-log', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: actionType,
                details: details
            })
        });
    } catch (error) {
        console.error('Failed to log action:', error);
    }
}

// Real-time Election Results Chart
let electionChart = null;
let chartRefreshInterval = null;

function showElectionChart(electionId, electionTitle, electionStatus) {
    // Create modal overlay
    const modalHTML = `
        <div id="chartModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; border-radius: 16px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="padding: 30px; border-bottom: 2px solid #e0e0e0; background: linear-gradient(135deg, #FF9933, #FF6600); color: white; border-radius: 16px 16px 0 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 24px;">📊 ${electionTitle}</h2>
                            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">
                                ${electionStatus === 'active' ? '🔴 LIVE - Auto-refreshing every 5 seconds' : '📈 Final Results'}
                            </p>
                        </div>
                        <button onclick="closeElectionChart()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
                            ✕ Close
                        </button>
                    </div>
                </div>
                <div style="padding: 30px;">
                    <div id="chartStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;"></div>
                    <canvas id="electionResultsChart" style="max-height: 400px;"></canvas>
                    <div id="chartDetails" style="margin-top: 30px;"></div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Load chart data
    loadElectionChart(electionId, electionStatus);
    
    // Auto-refresh if election is active
    if (electionStatus === 'active') {
        chartRefreshInterval = setInterval(() => {
            loadElectionChart(electionId, electionStatus);
        }, 5000); // Refresh every 5 seconds
    }
}

function closeElectionChart() {
    // Clear refresh interval
    if (chartRefreshInterval) {
        clearInterval(chartRefreshInterval);
        chartRefreshInterval = null;
    }
    
    // Destroy chart
    if (electionChart) {
        electionChart.destroy();
        electionChart = null;
    }
    
    // Remove modal
    const modal = document.getElementById('chartModal');
    if (modal) {
        modal.remove();
    }
}

async function loadElectionChart(electionId, electionStatus) {
    try {
        const response = await fetch(`/api/analytics/election-stats/${electionId}`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayElectionChart(data, electionStatus);
        }
    } catch (error) {
        console.error('Error loading election chart:', error);
    }
}

function displayElectionChart(data, electionStatus) {
    const candidates = data.candidates;
    const totalVotes = data.total_votes;
    
    // Update statistics
    const statsDiv = document.getElementById('chartStats');
    statsDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #FF9933, #FF6600); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${totalVotes}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Total Votes</div>
        </div>
        <div style="background: linear-gradient(135deg, #138808, #0a5a05); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${candidates.length}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Candidates</div>
        </div>
        <div style="background: linear-gradient(135deg, #000080, #0000b3); color: white; padding: 20px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700;">${data.state}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">State</div>
        </div>
    `;
    
    // Prepare chart data
    const labels = candidates.map(c => c.name);
    const votes = candidates.map(c => c.votes);
    const percentages = candidates.map(c => c.percentage);
    
    // Generate colors for each candidate
    const colors = [
        '#FF9933', // Saffron
        '#138808', // Green
        '#000080', // Navy Blue
        '#FF6600', // Orange
        '#0a5a05', // Dark Green
        '#0000b3', // Bright Blue
        '#cc7a29', // Brown Orange
        '#0f6e06'  // Forest Green
    ];
    
    // Destroy previous chart
    if (electionChart) {
        electionChart.destroy();
    }
    
    // Create new chart
    const ctx = document.getElementById('electionResultsChart');
    electionChart = new Chart(ctx, {
        type: 'doughnut',
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
                    text: electionStatus === 'active' ? '🔴 LIVE Vote Distribution' : 'Final Vote Distribution',
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
    const detailsDiv = document.getElementById('chartDetails');
    detailsDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">Detailed Results:</h3>
        ${candidates.map((candidate, index) => `
            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 4px solid ${colors[index]}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 16px; color: #333;">${candidate.name}</strong>
                    <span style="color: #666; margin-left: 10px;">(${candidate.party})</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: ${colors[index]};">${candidate.votes}</div>
                    <div style="font-size: 14px; color: #666;">${candidate.percentage}%</div>
                </div>
            </div>
        `).join('')}
    `;
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;
    
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 5000);
}

// Export Results Function
async function exportResults(electionId, format) {
    try {
        const response = await fetch(`/api/elections/${electionId}/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
        
        if (response.ok) {
            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `election_results_${electionId}.${format}`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            // Get the blob data
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showMessage(`Results exported successfully as ${format.toUpperCase()}`, 'success');
            
            // Log the export action
            logAdminAction('export_results', `Exported results for election ${electionId} as ${format}`);
        } else {
            const error = await response.json();
            showMessage(error.detail || 'Failed to export results', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Error exporting results', 'error');
    }
}

// Live Notification System
function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function clearNotifications() {
    notifications = [];
    updateNotificationDisplay();
    document.getElementById('notificationDropdown').style.display = 'none';
}

function updateNotificationDisplay() {
    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        badge.style.display = 'none';
        list.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No new notifications</p>';
        return;
    }
    
    badge.style.display = 'flex';
    badge.textContent = notifications.length;
    
    // Animate bell
    const bell = document.getElementById('notificationBell');
    bell.style.animation = 'ring 0.5s ease';
    setTimeout(() => bell.style.animation = '', 500);
    
    list.innerHTML = notifications.map((notif, index) => `
        <div style="padding: 15px; border-bottom: 1px solid #f0f0f0; transition: background 0.3s ease;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="font-size: 18px; margin-bottom: 5px;">${notif.icon}</div>
                    <div style="font-weight: 600; color: #2c3e50; font-size: 14px; margin-bottom: 5px;">${notif.title}</div>
                    <div style="color: #7f8c8d; font-size: 13px;">${notif.message}</div>
                    <div style="color: #95a5a6; font-size: 11px; margin-top: 5px;">${notif.time}</div>
                </div>
                <button onclick="removeNotification(${index})" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 18px; padding: 0 5px;">×</button>
            </div>
        </div>
    `).join('');
}

function removeNotification(index) {
    notifications.splice(index, 1);
    updateNotificationDisplay();
}

function addNotification(icon, title, message) {
    const time = new Date().toLocaleTimeString();
    notifications.unshift({ icon, title, message, time });
    
    // Keep only last 10 notifications
    if (notifications.length > 10) {
        notifications = notifications.slice(0, 10);
    }
    
    updateNotificationDisplay();
}

async function checkForNewActivity() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const currentVoteCount = data.total_votes;
            
            // Check for new votes
            if (lastVoteCount > 0 && currentVoteCount > lastVoteCount) {
                const newVotes = currentVoteCount - lastVoteCount;
                addNotification('🗳️', 'New Vote Cast', `${newVotes} new vote(s) recorded on blockchain`);
                
                // Play a subtle sound (optional)
                playNotificationSound();
            }
            
            lastVoteCount = currentVoteCount;
        }
    } catch (error) {
        console.error('Error checking activity:', error);
    }
}

function playNotificationSound() {
    // Create a subtle beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Silently fail if audio is not supported
    }
}

function startNotificationPolling() {
    // Check for new activity every 10 seconds
    notificationInterval = setInterval(checkForNewActivity, 10000);
    checkForNewActivity(); // Initial check
}

function stopNotificationPolling() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
}

// Add CSS animation for bell ring
const bellAnimationStyle = document.createElement('style');
bellAnimationStyle.textContent = `
    @keyframes ring {
        0%, 100% { transform: rotate(0deg); }
        10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
        20%, 40%, 60%, 80% { transform: rotate(10deg); }
    }
`;
document.head.appendChild(bellAnimationStyle);

// Close notification dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const bell = document.getElementById('notificationBell');
    
    if (dropdown && bell && !bell.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});


// =====================================================
// VOTER IMPORT FUNCTIONALITY
// =====================================================

async function downloadTemplate() {
    // Create a simple CSV template
    const csvContent = `name,aadhaar,state
Rajesh Kumar,123456789012,Maharashtra
Priya Sharma,234567890123,Delhi
Amit Patel,345678901234,Gujarat`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voter_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('✅ Template downloaded successfully!', 'success');
}

function handleFileSelect() {
    const fileInput = document.getElementById('voterFileInput');
    const selectedFileName = document.getElementById('selectedFileName');
    const fileNameText = document.getElementById('fileNameText');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const importStats = document.getElementById('importStats');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('❌ File size exceeds 10MB limit', 'error');
            clearSelectedFile();
            return;
        }
        
        // Validate file type
        const validExtensions = ['.csv', '.xlsx', '.xls'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            showNotification('❌ Invalid file type. Please upload CSV or Excel file', 'error');
            clearSelectedFile();
            return;
        }
        
        fileNameText.textContent = `📄 ${file.name} (${fileSize} MB)`;
        selectedFileName.style.display = 'block';
        uploadFileBtn.style.display = 'block';
        importStats.style.display = 'none';
    }
}

function clearSelectedFile() {
    const fileInput = document.getElementById('voterFileInput');
    const selectedFileName = document.getElementById('selectedFileName');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    
    fileInput.value = '';
    selectedFileName.style.display = 'none';
    uploadFileBtn.style.display = 'none';
}

async function handleFileUpload() {
    const fileInput = document.getElementById('voterFileInput');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const importStats = document.getElementById('importStats');
    const importStatsContent = document.getElementById('importStatsContent');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('❌ Please select a file first', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // Show loading state
    const originalText = uploadFileBtn.innerHTML;
    uploadFileBtn.innerHTML = '⏳ Importing...';
    uploadFileBtn.disabled = true;
    
    try {
        const response = await fetch('/api/admin/import-voters', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Import failed');
        }
        
        // Display success message
        showNotification(data.message, 'success');
        
        // Display statistics
        importStats.style.display = 'block';
        importStatsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #3498db;">
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${data.total_rows || 0}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">Total Rows</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #27ae60;">
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${data.imported || 0}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">Imported</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #e74c3c;">
                    <div style="font-size: 28px; font-weight: bold; color: #e74c3c;">${data.errors ? data.errors.length : 0}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">Errors</div>
                </div>
            </div>
            
            ${data.errors && data.errors.length > 0 ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px;">
                    <h5 style="margin: 0 0 10px 0; color: #856404;">⚠️ Errors Found:</h5>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${data.errors.slice(0, 20).map(err => `
                            <div style="font-size: 13px; color: #856404; margin: 5px 0;">
                                Row ${err.row}: ${err.error}
                            </div>
                        `).join('')}
                        ${data.errors.length > 20 ? `<div style="margin-top: 10px; font-style: italic;">... and ${data.errors.length - 20} more errors</div>` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        // Clear file selection
        clearSelectedFile();
        
        // Reload voters and dashboard stats
        loadVoters();
        loadStatistics();
        
    } catch (error) {
        console.error('Error uploading file:', error);
        showNotification('❌ ' + error.message, 'error');
    } finally {
        uploadFileBtn.innerHTML = originalText;
        uploadFileBtn.disabled = false;
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add animation styles
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);
