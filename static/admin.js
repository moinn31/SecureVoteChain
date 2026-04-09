let sessionToken = null;
let adminState = null;
let adminRole = null;
let notifications = [];
let lastVoteCount = 0;
let notificationInterval = null;

function normalizeImageSrc(value) {
    if (typeof value !== 'string') return null;

    const src = value.trim();
    if (!src) return null;

    // Allow safe image sources: data URLs, absolute URLs, and relative/static paths.
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

function getCandidateMediaHtml(candidate) {
    const photoSrc = normalizeImageSrc(
        candidate.photo || candidate.photo_url || candidate.image || candidate.candidate_photo
    ) || createFallbackImage(candidate.name || 'Candidate', '#FF9933', '#ffffff', 'circle');
    const logoSrc = normalizeImageSrc(
        candidate.logo || candidate.logo_url || candidate.party_logo || candidate.symbol
    ) || createFallbackImage(candidate.party || 'Party', '#0f6b4f', '#ffffff', 'rounded');

    const photoHtml = photoSrc
        ? `<img src="${photoSrc}" alt="${candidate.name || 'Candidate'}" title="Candidate Photo" style="width: 42px; height: 42px; object-fit: cover; border-radius: 50%; border: 2px solid #FF9933;">`
        : `<div style="width: 42px; height: 42px; border-radius: 50%; background: #f3f4f6; border: 2px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 20px;">👤</div>`;

    const logoHtml = logoSrc
        ? `<img src="${logoSrc}" alt="${candidate.party || 'Party'}" title="Party Image" style="width: 42px; height: 42px; object-fit: contain; border-radius: 8px; border: 1px solid #ddd; background: #fff; padding: 3px;">`
        : `<div style="width: 42px; height: 42px; border-radius: 8px; background: #fff; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 20px;">🏛️</div>`;

    return `
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 56px;">
                ${photoHtml}
                <span style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;">Photo</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 56px;">
                ${logoHtml}
                <span style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em;">Logo</span>
            </div>
        </div>`;
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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
            loadAnalyticsStateFilter();
            loadAuditStateFilter();
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
    
    // ===== MOBILE MENU TOGGLE =====
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle && sidebar && sidebarOverlay) {
        if (window.innerWidth <= 640) {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        // Toggle sidebar on button click
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            sidebarOverlay.classList.toggle('show');
            document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : 'auto';
        });
        
        // Close sidebar when overlay is clicked
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
        });
        
        // Close sidebar when nav item is clicked
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-open');
                    sidebarOverlay.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            });
        });
        
        // Close sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }
    // ===== END MOBILE MENU TOGGLE =====
    
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
        refreshAuditBtn.addEventListener('click', () => loadAuditLogs(1));
    }

    const applyAuditFiltersBtn = document.getElementById('applyAuditFiltersBtn');
    if (applyAuditFiltersBtn) {
        applyAuditFiltersBtn.addEventListener('click', applyAuditFilters);
    }

    const resetAuditFiltersBtn = document.getElementById('resetAuditFiltersBtn');
    if (resetAuditFiltersBtn) {
        resetAuditFiltersBtn.addEventListener('click', resetAuditFilters);
    }

    const auditSearchInput = document.getElementById('auditSearchInput');
    if (auditSearchInput) {
        auditSearchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyAuditFilters();
            }
        });
    }

    const auditPrevBtn = document.getElementById('auditPrevBtn');
    if (auditPrevBtn) {
        auditPrevBtn.addEventListener('click', () => gotoAuditPage(-1));
    }

    const auditNextBtn = document.getElementById('auditNextBtn');
    if (auditNextBtn) {
        auditNextBtn.addEventListener('click', () => gotoAuditPage(1));
    }

    loadAuditStateFilter();
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    const analyticsStateFilterElement = document.getElementById('analyticsStateFilter');
    if (analyticsStateFilterElement) {
        analyticsStateFilterElement.addEventListener('change', () => {
            analyticsStateFilter = analyticsStateFilterElement.value;
            loadAnalytics();
        });
    }

    loadAnalyticsStateFilter();

    window.addEventListener('storage', (event) => {
        if (event.key === 'voteUpdatedAt') {
            loadElections();
            loadStatistics();
        }
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
            loadAnalyticsStateFilter();
            loadAuditStateFilter();
            
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
        <label style="background: #3b82f6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; overflow: hidden;">
            <span class="media-label-text">📷 Photo</span>
            <input type="file" class="candidate-photo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidatePhoto(this)">
        </label>
        <label style="background: #8b5cf6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; overflow: hidden;">
            <span class="media-label-text">🎨 Logo</span>
            <input type="file" class="candidate-logo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidateLogo(this)">
        </label>
        <button type="button" class="remove-candidate-btn" onclick="this.parentElement.remove()" style="background: #dc2626; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: all 0.3s;">✕</button>
    `;
    candidatesList.appendChild(newRow);
}

function updateMediaPreview(input, labelText, previewSrc, successColor, fileName) {
    const label = input.parentElement;
    if (!label) return;

    let textNode = label.querySelector('.media-label-text');
    if (!textNode) {
        const translatedNode = label.querySelector('[data-translate]');
        if (translatedNode) {
            translatedNode.classList.add('media-label-text');
            translatedNode.removeAttribute('data-translate');
            textNode = translatedNode;
        }
    }

    // Remove plain text nodes (like "📷" / "Upload Photo") that can overlap after preview updates.
    for (const node of Array.from(label.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            label.removeChild(node);
        }
    }

    if (!textNode) {
        textNode = document.createElement('span');
        textNode.className = 'media-label-text';
        label.insertBefore(textNode, input);
    }

    let preview = label.querySelector('.media-preview-thumb');
    if (!preview) {
        preview = document.createElement('img');
        preview.className = 'media-preview-thumb';
        preview.style.width = '24px';
        preview.style.height = '24px';
        preview.style.objectFit = 'cover';
        preview.style.borderRadius = '4px';
        preview.style.border = '1px solid rgba(255,255,255,0.45)';
        label.insertBefore(preview, input);
    }

    label.style.background = successColor;
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'center';
    label.style.gap = '6px';
    label.style.overflow = 'hidden';

    textNode.textContent = labelText;
    preview.src = previewSrc;
    label.title = fileName;
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
            updateMediaPreview(input, '✅ Photo', e.target.result, '#10b981', file.name);
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
            updateMediaPreview(input, '✅ Logo', e.target.result, '#7c3aed', file.name);
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
                    <label style="background: #3b82f6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; overflow: hidden;">
                        <span class="media-label-text">📷 Photo</span>
                        <input type="file" class="candidate-photo" accept="image/png,image/jpeg,image/jpg" style="display: none;" onchange="previewCandidatePhoto(this)">
                    </label>
                    <label style="background: #8b5cf6; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: center; white-space: nowrap; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; overflow: hidden;">
                        <span class="media-label-text">🎨 Logo</span>
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
        const elections = data.elections || [];
        
        const electionsList = document.getElementById('electionsList');
        
        if (elections.length === 0) {
            electionsList.innerHTML = `
                <div class="info-box">
                    <p><strong>No elections found for ${adminState || 'your jurisdiction'}</strong></p>
                    <p>Create a new election to get started.</p>
                </div>
            `;
            return;
        }

        electionsList.innerHTML = '';

        // Load all election results in parallel to reduce dashboard load time.
        const resultsEntries = await Promise.all(
            elections.map(async (election) => {
                try {
                    const resultsResponse = await fetch(`/api/elections/${election.id}/results`);
                    if (resultsResponse.ok) {
                        return [election.id, await resultsResponse.json()];
                    }
                    console.warn(`Failed to load results for election ${election.id}`);
                } catch (error) {
                    console.error(`Error fetching results for election ${election.id}:`, error);
                }
                return [election.id, { results: [], total_votes: 0 }];
            })
        );
        const resultsByElectionId = Object.fromEntries(resultsEntries);
        
        for (const election of elections) {
            const resultsData = resultsByElectionId[election.id] || { results: [], total_votes: 0 };

            const sortedResults = [...(resultsData.results || [])].sort((a, b) => {
                const voteDiff = (b.votes || 0) - (a.votes || 0);
                if (voteDiff !== 0) return voteDiff;
                return (a.name || '').localeCompare(b.name || '');
            });
            const totalVotes = resultsData.total_votes || 0;
            const topCandidate = totalVotes > 0 && sortedResults.length > 0 ? sortedResults[0] : null;
            const topLabel = election.status === 'ended' ? 'Winner' : 'Current Leader';
            
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
                    ${sortedResults.length > 0 ? sortedResults.map((r, index) => {
                        const mediaDisplay = getCandidateMediaHtml(r);
                        const isLeading = index === 0 && totalVotes > 0;
                        const leadingBadgeLabel = election.status === 'ended' ? 'WINNER' : 'LEADING';
                        const percentageValue = totalVotes > 0
                            ? (((r.votes || 0) / totalVotes) * 100).toFixed(2)
                            : Number(r.percentage || 0).toFixed(2);
                        
                        return `
                        <div class="result-item">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                ${mediaDisplay}
                                <div>
                                    <strong>${r.name}</strong> (${r.party}) ${isLeading ? `<span style="margin-left: 8px; padding: 3px 10px; border-radius: 999px; background: linear-gradient(135deg, #34d399, #10b981); color: #052e22; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 2px 8px rgba(16,185,129,0.35);">${leadingBadgeLabel}</span>` : ''}
                                    <br><small>${r.votes} votes (${percentageValue}%)</small>
                                </div>
                            </div>
                        </div>
                    `}).join('') : '<p style="text-align: center; color: #999;">No votes cast yet</p>'}
                </div>
                <p><strong>Total Votes:</strong> ${totalVotes}</p>
                ${topCandidate ? `
                <div style="margin-top: 12px; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(110, 231, 255, 0.45); background: linear-gradient(135deg, rgba(27, 40, 88, 0.92), rgba(36, 84, 126, 0.9)); box-shadow: 0 10px 24px rgba(8, 15, 45, 0.35);">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">🏆 ${topLabel}</p>
                    <p style="margin: 6px 0 0 0; font-size: 15px; color: #ffffff; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong>${topCandidate.name}</strong> (${topCandidate.party})
                        <span style="padding: 3px 10px; border-radius: 999px; background: linear-gradient(135deg, #34d399, #10b981); color: #052e22; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; border: 1px solid rgba(255,255,255,0.35);">${election.status === 'ended' ? 'WINNER' : 'LEADING'}</span>
                        <span style="margin-left: 8px; opacity: 0.95; color: #d9f5ff; font-weight: 500;">${topCandidate.votes} votes • ${totalVotes > 0 ? (((topCandidate.votes || 0) / totalVotes) * 100).toFixed(2) : Number(topCandidate.percentage || 0).toFixed(2)}%</span>
                    </p>
                </div>
                ` : ''}
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
let analyticsStateFilter = 'All States';
let participationFunnelChart = null;

function getAnalyticsStateQuery() {
    const stateFilter = document.getElementById('analyticsStateFilter');
    analyticsStateFilter = (stateFilter && stateFilter.value) ? stateFilter.value : (analyticsStateFilter || 'All States');
    return analyticsStateFilter && analyticsStateFilter !== 'All States'
        ? `?state=${encodeURIComponent(analyticsStateFilter)}`
        : '';
}

async function loadAnalyticsStateFilter() {
    const stateFilter = document.getElementById('analyticsStateFilter');
    if (!stateFilter) return;

    try {
        const response = await fetch('/api/states');
        const data = await response.json();
        const states = Array.isArray(data.states) ? data.states : [];

        stateFilter.innerHTML = '<option value="All States">All States</option>';
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });

        if (adminState && adminState !== 'All States') {
            analyticsStateFilter = adminState;
            stateFilter.value = adminState;
            stateFilter.disabled = true;
        } else {
            stateFilter.disabled = false;
            stateFilter.value = analyticsStateFilter || 'All States';
        }
    } catch (error) {
        console.error('Error loading analytics states:', error);
        stateFilter.innerHTML = '<option value="All States">All States</option>';
        stateFilter.value = analyticsStateFilter || 'All States';
    }
}

async function loadAnalytics() {
    try {
        const stateQuery = getAnalyticsStateQuery();
        const response = await fetch(`/api/analytics/voter-turnout${stateQuery}`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayTurnoutAnalytics((data && data.statistics) || {});
        } else {
            showMessage('Failed to load analytics', 'error');
        }

        await loadParticipationFunnel();
    } catch (error) {
        console.error('Error loading analytics:', error);
        showMessage('Error loading analytics', 'error');
    }
}

async function loadParticipationFunnel() {
    try {
        const stateQuery = getAnalyticsStateQuery();
        const response = await fetch(`/api/analytics/participation-funnel${stateQuery}`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            displayParticipationFunnel(data || {});
        } else {
            showMessage('Failed to load participation funnel', 'error');
        }
    } catch (error) {
        console.error('Error loading participation funnel:', error);
        showMessage('Error loading participation funnel', 'error');
    }
}

function displayTurnoutAnalytics(statistics) {
    const safeStatistics = statistics && typeof statistics === 'object' ? statistics : {};
    const states = Object.keys(safeStatistics);

    if (states.length === 0) {
        if (turnoutChart) {
            turnoutChart.destroy();
            turnoutChart = null;
        }
        const detailsDiv = document.getElementById('analyticsDetails');
        if (detailsDiv) {
            detailsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">No analytics data available yet.</p>';
        }
        return;
    }

    const turnoutData = states.map(state => safeStatistics[state].turnout_percentage || 0);
    const totalVoters = states.map(state => safeStatistics[state].total_voters || 0);
    const votedCounts = states.map(state => safeStatistics[state].voted_count || 0);
    
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

function displayParticipationFunnel(data) {
    const stages = Array.isArray(data.stages) ? data.stages : [];
    const summary = data.summary || {};

    const cardsDiv = document.getElementById('participationFunnelCards');
    const chartCanvas = document.getElementById('participationFunnelChart');

    if (!cardsDiv || !chartCanvas) return;

    if (stages.length === 0) {
        if (participationFunnelChart) {
            participationFunnelChart.destroy();
            participationFunnelChart = null;
        }
        cardsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 30px; grid-column: 1 / -1;">No funnel data available yet.</p>';
        return;
    }

    const totalRegistered = Number(summary.registered_count || 0);
    cardsDiv.innerHTML = stages.map((stage, index) => {
        const previousCount = index === 0 ? stage.count : (stages[index - 1].count || 0);
        const dropOff = index === 0 ? 0 : Math.max(previousCount - stage.count, 0);
        const dropOffRate = index === 0 || previousCount === 0 ? 0 : roundToTwo((dropOff / previousCount) * 100);
        return `
            <div style="background: linear-gradient(135deg, #ffffff, #f8fafc); padding: 18px; border-radius: 14px; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">${escapeHtml(stage.label)}</div>
                        <div style="font-size: 30px; font-weight: 800; color: ${stage.color || '#333'}; line-height: 1.1; margin-top: 6px;">${stage.count}</div>
                    </div>
                    <div style="padding: 6px 10px; border-radius: 999px; background: rgba(0,0,0,0.05); color: #334155; font-size: 12px; font-weight: 700;">
                        ${Number(stage.conversion_rate || 0).toFixed(2)}%
                    </div>
                </div>
                <div style="font-size: 13px; color: #475569; display: grid; gap: 6px;">
                    <div>Share of registered: <strong>${totalRegistered > 0 ? roundToTwo((stage.count / totalRegistered) * 100) : 0}%</strong></div>
                    <div>${index === 0 ? 'Baseline stage' : `Drop-off from previous: <strong>${dropOff}</strong> (${dropOffRate}%)`}</div>
                </div>
            </div>
        `;
    }).join('');

    if (participationFunnelChart) {
        participationFunnelChart.destroy();
    }

    participationFunnelChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: stages.map(stage => stage.label),
            datasets: [{
                label: 'Voter Count',
                data: stages.map(stage => stage.count),
                backgroundColor: stages.map(stage => stage.color || '#FF9933'),
                borderColor: stages.map(stage => stage.color || '#FF9933'),
                borderWidth: 1,
                borderRadius: 10,
                barThickness: 26
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `Participation Funnel${data.state && data.state !== 'All States' ? ` - ${data.state}` : ''}`,
                    font: { size: 18, family: 'Poppins' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const stage = stages[context.dataIndex] || {};
                            return `${stage.count || 0} voters (${Number(stage.conversion_rate || 0).toFixed(2)}% conversion)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                },
                y: {
                    ticks: {
                        font: { size: 13, family: 'Poppins' }
                    }
                }
            }
        }
    });
}

function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Audit Log Functions
let auditPagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
};

async function loadAuditStateFilter() {
    const stateFilter = document.getElementById('auditStateFilter');
    if (!stateFilter) return;

    try {
        const response = await fetch('/api/states');
        const data = await response.json();
        const states = Array.isArray(data.states) ? data.states : [];

        stateFilter.innerHTML = '<option value="All States">All States</option>';
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });

        if (adminState && adminState !== 'All States') {
            stateFilter.value = adminState;
            stateFilter.disabled = true;
        } else {
            stateFilter.disabled = false;
        }
    } catch (error) {
        console.error('Error loading audit states:', error);
        stateFilter.innerHTML = '<option value="All States">All States</option>';
    }
}

function readAuditFilters() {
    const search = document.getElementById('auditSearchInput');
    const action = document.getElementById('auditActionFilter');
    const username = document.getElementById('auditUsernameFilter');
    const state = document.getElementById('auditStateFilter');
    const role = document.getElementById('auditRoleFilter');
    const pageSize = document.getElementById('auditPageSize');

    return {
        search: search ? search.value.trim() : '',
        action: action ? action.value.trim() : '',
        username: username ? username.value.trim() : '',
        state: state ? state.value : 'All States',
        role: role ? role.value.trim() : '',
        pageSize: pageSize ? parseInt(pageSize.value, 10) || 10 : 10
    };
}

function setAuditPaginationInfo() {
    const info = document.getElementById('auditPaginationInfo');
    const prevBtn = document.getElementById('auditPrevBtn');
    const nextBtn = document.getElementById('auditNextBtn');

    if (info) {
        if (auditPagination.total === 0) {
            info.textContent = 'No audit logs found';
        } else {
            const start = ((auditPagination.page - 1) * auditPagination.pageSize) + 1;
            const end = Math.min(auditPagination.page * auditPagination.pageSize, auditPagination.total);
            info.textContent = `Showing ${start}-${end} of ${auditPagination.total} logs`;
        }
    }

    if (prevBtn) prevBtn.disabled = auditPagination.page <= 1;
    if (nextBtn) nextBtn.disabled = auditPagination.page >= auditPagination.totalPages;
}

function buildAuditQueryParams(pageOverride) {
    const filters = readAuditFilters();
    auditPagination.pageSize = filters.pageSize;
    const page = pageOverride || auditPagination.page || 1;

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(filters.pageSize)
    });

    if (filters.search) params.set('search', filters.search);
    if (filters.action) params.set('action', filters.action);
    if (filters.username) params.set('username', filters.username);
    if (filters.state && filters.state !== 'All States') params.set('state', filters.state);
    if (filters.role) params.set('role', filters.role);

    return params;
}
async function loadAuditLogs(pageOverride) {
    try {
        const params = buildAuditQueryParams(pageOverride);
        const response = await fetch(`/api/audit-logs?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            auditPagination.page = data.page || 1;
            auditPagination.pageSize = data.page_size || auditPagination.pageSize || 10;
            auditPagination.total = data.total || 0;
            auditPagination.totalPages = data.total_pages || 0;
            displayAuditLogs(data.logs);
            setAuditPaginationInfo();
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
    const safeLogs = Array.isArray(logs) ? logs : [];
    
    if (safeLogs.length === 0) {
        logsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No audit logs found</p>';
        return;
    }
    
    logsDiv.innerHTML = safeLogs.map(log => {
        const actionType = log.action_type || log.action || 'unknown';
        const actionDetails = log.action_details || log.details || 'No details';
        const adminUsername = log.admin_username || log.username || log.user_id || 'unknown';
        const adminState = log.admin_state || log.state || 'N/A';
        const adminRole = log.admin_role || log.role || 'admin';
        const ipAddress = log.ip_address || 'N/A';

        const date = new Date(log.timestamp || Date.now());
        const timeStr = date.toLocaleString();
        
        const actionTypeColors = {
            'election_created': '#138808',
            'election_deleted': '#d32f2f',
            'election_updated': '#FF9933',
            'create_election': '#138808',
            'delete_election': '#d32f2f',
            'login': '#000080',
            'logout': '#666'
        };
        
        const actionColor = actionTypeColors[actionType] || '#666';
        
        return `
            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${actionColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <strong style="color: ${actionColor}; text-transform: uppercase; font-size: 12px;">${escapeHtml(actionType)}</strong>
                        <p style="margin: 5px 0; color: #333;">${escapeHtml(actionDetails)}</p>
                    </div>
                    <span style="color: #999; font-size: 12px; white-space: nowrap; margin-left: 15px;">${timeStr}</span>
                </div>
                <div style="display: flex; gap: 20px; font-size: 12px; color: #666;">
                    <span>👤 ${escapeHtml(adminUsername)}</span>
                    <span>📍 ${escapeHtml(adminState)}</span>
                    <span>🔒 ${escapeHtml(adminRole)}</span>
                    <span>🌐 ${escapeHtml(ipAddress)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function applyAuditFilters() {
    auditPagination.page = 1;
    loadAuditLogs(1);
}

function resetAuditFilters() {
    const search = document.getElementById('auditSearchInput');
    const action = document.getElementById('auditActionFilter');
    const username = document.getElementById('auditUsernameFilter');
    const state = document.getElementById('auditStateFilter');
    const role = document.getElementById('auditRoleFilter');
    const pageSize = document.getElementById('auditPageSize');

    if (search) search.value = '';
    if (action) action.value = '';
    if (username) username.value = '';
    if (role) role.value = '';
    if (pageSize) pageSize.value = '10';
    if (state && !(adminState && adminState !== 'All States')) {
        state.value = 'All States';
    }

    auditPagination.page = 1;
    auditPagination.pageSize = 10;
    loadAuditStateFilter();
    loadAuditLogs(1);
}

function gotoAuditPage(direction) {
    const nextPage = auditPagination.page + direction;
    if (nextPage < 1) return;
    if (auditPagination.totalPages && nextPage > auditPagination.totalPages) return;
    loadAuditLogs(nextPage);
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
    const candidates = [...(data.candidates || [])].sort((a, b) => {
        const voteDiff = (b.votes || 0) - (a.votes || 0);
        if (voteDiff !== 0) return voteDiff;
        return (a.name || '').localeCompare(b.name || '');
    });
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
        ${candidates.map((candidate, index) => {
            const isLeading = index === 0 && totalVotes > 0;
            return `
            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 4px solid ${colors[index]}; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${getCandidateMediaHtml(candidate)}
                    <div>
                        <strong style="font-size: 16px; color: #333;">${candidate.name}</strong>
                        ${isLeading ? '<span style="margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(52, 211, 153, 0.2); color: #0f5132; font-size: 11px; font-weight: 700;">LEADING</span>' : ''}
                        <span style="color: #666; margin-left: 10px;">(${candidate.party})</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 700; color: ${colors[index]};">${candidate.votes}</div>
                    <div style="font-size: 14px; color: #666;">${candidate.percentage}%</div>
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
    }, 5000);
}

async function getElectionReportData(electionId) {
    const [electionsResponse, resultsResponse] = await Promise.all([
        fetch('/api/elections', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        }),
        fetch(`/api/elections/${electionId}/results`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        })
    ]);

    if (!electionsResponse.ok) {
        throw new Error('Unable to fetch elections data for report');
    }
    if (!resultsResponse.ok) {
        throw new Error('Unable to fetch election results for report');
    }

    const electionsData = await electionsResponse.json();
    const resultsData = await resultsResponse.json();
    const election = (electionsData.elections || []).find(e => e.id === electionId);

    if (!election) {
        throw new Error('Election not found for report generation');
    }

    const sortedCandidates = [...(resultsData.results || [])].sort((a, b) => {
        const voteDiff = (b.votes || 0) - (a.votes || 0);
        if (voteDiff !== 0) return voteDiff;
        return (a.name || '').localeCompare(b.name || '');
    });

    const totalVotes = Number(resultsData.total_votes || 0);
    const generatedAt = new Date().toISOString();
    const leader = sortedCandidates.length > 0 ? sortedCandidates[0] : null;

    return {
        generated_at: generatedAt,
        election: {
            id: election.id,
            title: election.title,
            description: election.description,
            state: election.state,
            status: election.status,
            start_time: election.start_time,
            end_time: election.end_time
        },
        summary: {
            total_votes: totalVotes,
            total_candidates: sortedCandidates.length,
            leading_candidate: leader ? {
                name: leader.name,
                party: leader.party,
                votes: leader.votes,
                percentage: leader.percentage
            } : null
        },
        candidates: sortedCandidates.map((candidate, index) => ({
            rank: index + 1,
            is_leading: index === 0 && totalVotes > 0,
            name: candidate.name,
            party: candidate.party,
            votes: candidate.votes || 0,
            percentage: Number(candidate.percentage || 0)
        }))
    };
}

function downloadTextFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function buildElectionResultsCsv(report) {
    const header = [
        'Generated At',
        'Election ID',
        'Election Title',
        'State',
        'Status',
        'Start Time',
        'End Time',
        'Total Votes',
        'Rank',
        'Candidate Name',
        'Party',
        'Votes',
        'Percentage',
        'Leading'
    ];

    const rows = report.candidates.map(candidate => [
        report.generated_at,
        report.election.id,
        report.election.title,
        report.election.state,
        report.election.status,
        report.election.start_time,
        report.election.end_time,
        report.summary.total_votes,
        candidate.rank,
        candidate.name,
        candidate.party,
        candidate.votes,
        candidate.percentage,
        candidate.is_leading ? 'YES' : 'NO'
    ]);

    const escapeCell = (value) => {
        const text = String(value ?? '');
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };

    return [header, ...rows].map(row => row.map(escapeCell).join(',')).join('\n');
}

// Export Results Function
async function exportResults(electionId, format) {
    try {
        const report = await getElectionReportData(electionId);
        const safeTitle = (report.election.title || 'election').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');

        if (format === 'json') {
            const content = JSON.stringify(report, null, 2);
            const filename = `${safeTitle || 'election'}_results_report.json`;
            downloadTextFile(content, filename, 'application/json;charset=utf-8');
        } else if (format === 'csv') {
            const content = buildElectionResultsCsv(report);
            const filename = `${safeTitle || 'election'}_results_report.csv`;
            downloadTextFile(content, filename, 'text/csv;charset=utf-8');
        } else {
            showMessage('Unsupported export format selected', 'error');
            return;
        }

        showMessage(`Results exported successfully as ${format.toUpperCase()}`, 'success');
        logAdminAction('export_results', `Exported ranked results report for election ${electionId} as ${format}`);
    } catch (error) {
        console.error('Export error:', error);
        showMessage(error.message || 'Error exporting results', 'error');
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
    try {
        const response = await fetch('/api/admin/download-voter-template', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || 'Failed to download template');
        }

        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition') || '';
        const match = disposition.match(/filename="?([^";]+)"?/i);
        const filename = match ? match[1] : 'voter_import_template.csv';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('✅ Template downloaded successfully!', 'success');
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
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
        const validExtensions = ['.csv', '.xlsx'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            showNotification('❌ Invalid file type. Please upload CSV or XLSX file', 'error');
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
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${data.total_rows || data.total || 0}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">Total Rows</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #27ae60;">
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${data.imported || data.imported_count || 0}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">Imported</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #e74c3c;">
                    <div style="font-size: 28px; font-weight: bold; color: #e74c3c;">${data.error_count ?? (data.errors ? data.errors.length : 0)}</div>
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
