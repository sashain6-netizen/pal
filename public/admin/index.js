let reportsData = [];
let bannedUsersData = [];
let filteredReports = [];
let filteredBannedUsers = [];
let currentTab = 'reports';
let currentUserRank = 'Member';

// Load all data on page load
document.addEventListener('DOMContentLoaded', loadAllData);

async function loadAllData() {
    // Get current user info first
    try {
        const profileResponse = await fetch('/api/get-profile');
        if (profileResponse.ok) {
            const currentUser = await profileResponse.json();
            currentUserRank = currentUser.rank || 'Member';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
    
    await Promise.all([
        loadReports(),
        loadBannedUsers()
    ]);
    updateQuickStats();
}

// Reports Management
async function loadReports() {
    try {
        const response = await fetch('/api/report-user');
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        reportsData = data.reports || [];
        filteredReports = [...reportsData];
        
        renderReports();
    } catch (error) {
        console.error('Error loading reports:', error);
        showToast('Failed to load reports', 'error');
        showReportsError();
    }
}

function renderReports() {
    const container = document.getElementById('reports-list');
    
    if (filteredReports.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚩</div>
                <h3>No reports found</h3>
                <p>${reportsData.length === 0 ? 'No reports have been submitted' : 'No reports match your search criteria'}</p>
            </div>
        `;
        return;
    }
    
    const sortedReports = [...filteredReports].sort((a, b) => {
        const statusOrder = { 'pending': 0, 'resolved': 1, 'deleted': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    
    const reportsHTML = sortedReports.map(report => {
        const statusClass = report.status === 'pending' ? 'pending' : 
                           report.status === 'resolved' ? 'resolved' : 'deleted';
        const statusText = report.status.charAt(0).toUpperCase() + report.status.slice(1);
        const isResolved = report.status === 'resolved';
        
        // Check if user is allowed to delete
        const canDelete = currentUserRank === 'Owner';
        
        return `
            <div class="report-card ${statusClass} ${isResolved ? 'resolved-report' : ''}">
                <div class="report-header">
                    <div class="report-info">
                        <h3 class="report-id">#${report.id}</h3>
                        <span class="report-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="report-date">${formatDate(report.date)}</div>
                </div>
                
                <div class="report-content">
                    <div class="report-details">
                        <p><strong>Reported:</strong> ${escapeHTML(report.reportedUsername)}</p>
                        <p><strong>Reporter:</strong> ${escapeHTML(report.reporterUsername)}</p>
                        <p><strong>Reason:</strong> ${escapeHTML(report.reason)}</p>
                        ${report.description ? `<p><strong>Description:</strong> ${escapeHTML(report.description)}</p>` : ''}
                        ${isResolved && report.resolvedAt ? `<p><strong>Resolved:</strong> ${formatDate(report.resolvedAt)}</p>` : ''}
                        ${isResolved && report.resolvedBy ? `<p><strong>Resolved By:</strong> ${escapeHTML(report.resolvedBy)}</p>` : ''}
                    </div>
                    
                    <div class="report-actions">
                        ${isResolved ? `
                            <a href="/users?id=${escapeHTML(report.reportedUsername)}" class="admin-btn primary-btn">
                                👁 View User
                            </a>
                            ${canDelete ? `
                                <button onclick="deleteReport('${report.id}')" class="admin-btn danger-btn">
                                    🗑️ Delete
                                </button>
                            ` : ''}
                        ` : `
                            <a href="/users?id=${escapeHTML(report.reportedUsername)}" class="admin-btn user-link-btn">
                                👁 View User
                            </a>
                            ${report.status === 'pending' ? `
                                <button onclick="resolveReport('${report.id}')" class="admin-btn success-btn">
                                    ✅ Resolve
                                </button>
                            ` : ''}
                            ${canDelete ? `
                                <button onclick="deleteReport('${report.id}')" class="admin-btn danger-btn">
                                    🗑️ Delete
                                </button>
                            ` : ''}
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = reportsHTML;
}

// Banned Users Management
async function loadBannedUsers() {
    try {
        // Get current user's rank for permission checking
        const profileResponse = await fetch('/api/get-profile');
        const currentUser = profileResponse.ok ? await profileResponse.json() : null;
        const myRank = currentUser?.rank || 'Member';
        
        const response = await fetch('/api/banned-users');
        if (!response.ok) {
            throw new Error('Failed to fetch banned users');
        }
        
        const data = await response.json();
        bannedUsersData = data.bannedUsers || [];
        filteredBannedUsers = [...bannedUsersData];
        
        renderBannedUsers(myRank);
    } catch (error) {
        console.error('Error loading banned users:', error);
        showToast('Failed to load banned users', 'error');
        showBannedError();
    }
}

function renderBannedUsers(myRank) {
    const container = document.getElementById('banned-users-list');
    
    if (filteredBannedUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚫</div>
                <h3>No banned users found</h3>
                <p>${bannedUsersData.length === 0 ? 'No users are currently banned' : 'No users match your search criteria'}</p>
            </div>
        `;
        return;
    }
    
    const usersHTML = filteredBannedUsers.map(user => {
    const timeDisplay = formatTimeRemaining(user.timeRemaining);
    const banStatusClass = user.banStatus === 'Permanent' ? 'permanent' : 'temporary';
    
    // 1. Initial hierarchy check
    const rankHierarchy = { 
        "Owner": 3, "Admin": 2, "Manager": 2, "Moderator": 1, "Staff": 0,
        "Member": -7 
    };

    let canUnban = myRank === "Owner" ? 
        (user.rank !== "Owner") : 
        (rankHierarchy[user.rank] < rankHierarchy[myRank]);
    
    // 2. The Fixed Moderator Restriction
    if (canUnban && myRank === "Moderator") {
        if (user.banStatus === 'Permanent') {
            canUnban = false;
        } else if (user.timeRemaining && user.timeRemaining.expirationDate) {
            const oneDayMs = 24 * 60 * 60 * 1000;
            
            // Fix: Your backend uses 'banDate'. If it's "Unknown", we should 
            // play it safe and hide the unban button (or assume it's old/long).
            if (user.banDate === "Unknown") {
                canUnban = false; 
            } else {
                const banStart = new Date(user.banDate).getTime();
                const banEnd = new Date(user.timeRemaining.expirationDate).getTime();
                
                if (isNaN(banStart) || (banEnd - banStart) > oneDayMs) {
                    canUnban = false;
                }
            }
        }
    }
        
        return `
            <div class="banned-user-card ${banStatusClass}">
                <div class="user-info">
                    <div class="user-avatar">
                        <img src="/default-avatar.png" alt="${user.displayName}">
                    </div>
                    <div class="user-details">
                        <h3 class="user-name">${escapeHTML(user.displayName)}</h3>
                        <p class="user-username">@${escapeHTML(user.username)}</p>
                        <span class="user-rank">${escapeHTML(user.rank)}</span>
                    </div>
                </div>
                
                <div class="ban-info">
                    <div class="ban-reason">
                        <strong>Reason:</strong> ${escapeHTML(user.banReason)}
                    </div>
                    <div class="ban-time">
                        <strong>Status:</strong> 
                        <span class="ban-status ${banStatusClass}">
                            ${user.banStatus}
                        </span>
                    </div>
                    ${user.timeRemaining ? `
                        <div class="time-remaining">
                            <strong>Time remaining:</strong> 
                            <span class="countdown" data-expiration="${user.timeRemaining.expirationDate}">
                                ${timeDisplay}
                            </span>
                        </div>
                    ` : ''}
                    <div class="ban-date">
                        <strong>Banned on:</strong> ${formatDate(user.banDate)}
                    </div>
                </div>
                
                <div class="user-actions">
                    <a href="/users?id=${user.username}" class="admin-btn secondary-btn">
                        👁️ View
                    </a>
                    ${canUnban ? `
                        <button onclick="showUnbanModal('${user.username}', '${user.displayName}')" class="admin-btn success-btn">
                            ✅ Unban
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = usersHTML;
    
    // Start countdown timers
    startCountdownTimers();
}

// Tab Navigation
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-section`).classList.add('active');
    
    currentTab = tabName;
}

// Search and Filter
document.getElementById('reports-search')?.addEventListener('input', () => filterReports());
document.getElementById('reports-filter')?.addEventListener('change', () => filterReports());
document.getElementById('banned-search')?.addEventListener('input', () => filterBannedUsers());
document.getElementById('banned-filter')?.addEventListener('change', () => filterBannedUsers());

function filterReports() {
    const searchTerm = document.getElementById('reports-search').value.toLowerCase();
    const filterType = document.getElementById('reports-filter').value;
    
    filteredReports = reportsData.filter(report => {
        const matchesSearch = report.reportedUsername.toLowerCase().includes(searchTerm) ||
                            report.reporterUsername.toLowerCase().includes(searchTerm) ||
                            report.reason.toLowerCase().includes(searchTerm);
        
        const matchesFilter = filterType === 'all' ||
                            report.status === filterType;
        
        return matchesSearch && matchesFilter;
    });
    
    renderReports();
}

function filterBannedUsers() {
    const searchTerm = document.getElementById('banned-search').value.toLowerCase();
    const filterType = document.getElementById('banned-filter').value;
    
    filteredBannedUsers = bannedUsersData.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) ||
                            user.displayName.toLowerCase().includes(searchTerm);
        
        const matchesFilter = filterType === 'all' ||
                            (filterType === 'temporary' && user.banStatus === 'Temporary') ||
                            (filterType === 'permanent' && user.banStatus === 'Permanent');
        
        return matchesSearch && matchesFilter;
    });
    
    // Get current user rank to pass to renderBannedUsers
    fetch('/api/get-profile')
        .then(response => response.ok ? response.json() : Promise.resolve(null))
        .then(currentUser => {
            const myRank = currentUser?.rank || 'Member';
            renderBannedUsers(myRank);
        })
        .catch(error => {
            console.error('Error getting user profile:', error);
            renderBannedUsers('Member'); // Fallback to lowest rank
        });
}

// Report Actions
async function resolveReport(reportId) {
    try {
        const response = await fetch('/api/report-user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportId,
                status: 'resolved'
            })
        });
        
        if (response.ok) {
            showToast('Report marked as resolved', 'success');
            closeReportModal();
            loadReports();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to resolve report', 'error');
        }
    } catch (error) {
        console.error('Resolve report error:', error);
        showToast('Failed to resolve report', 'error');
    }
}

async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/report-user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportId,
                status: 'deleted'
            })
        });
        
        if (response.ok) {
            showToast('Report deleted successfully', 'success');
            closeReportModal();
            loadReports();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to delete report', 'error');
        }
    } catch (error) {
        console.error('Delete report error:', error);
        showToast('Failed to delete report', 'error');
    }
}

// Ban Actions
function showBanModal(username) {
    document.getElementById('ban-username').textContent = username;
    document.getElementById('ban-modal').style.display = 'flex';
    
    // Clear previous values
    document.getElementById('ban-reason').value = '';
    document.getElementById('ban-duration').value = '3600seconds';
    
    // Focus on reason input
    setTimeout(() => {
        document.getElementById('ban-reason').focus();
    }, 100);
    
    // Add escape key listener
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeBanModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeBanModal() {
    document.getElementById('ban-modal').style.display = 'none';
}

document.getElementById('confirm-ban')?.addEventListener('click', async () => {
    const username = document.getElementById('ban-username').textContent;
    const reason = document.getElementById('ban-reason').value.trim();
    const duration = document.getElementById('ban-duration').value;
    
    if (!reason) {
        showToast('Please enter a ban reason', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/ban-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUsername: username,
                reason: reason,
                duration: duration
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast(`Successfully banned ${username}`, 'success');
            closeBanModal();
            loadBannedUsers();
            
            // Also refresh reports to update the UI
            loadReports();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to ban user', 'error');
        }
    } catch (error) {
        console.error('Ban error:', error);
        showToast('Failed to ban user', 'error');
    }
});

// Unban Actions
function showUnbanModal(username, displayName) {
    const modal = document.getElementById('unban-modal');
    const nameSpan = document.getElementById('unban-username');
    
    const confirmBtn = document.getElementById('confirm-unban');
    confirmBtn.setAttribute('data-target-username', username);
    
    nameSpan.textContent = displayName;
    modal.style.display = 'flex';
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeUnbanModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

document.getElementById('confirm-unban')?.addEventListener('click', async () => {
    const confirmBtn = document.getElementById('confirm-unban');
    const targetUsername = confirmBtn.getAttribute('data-target-username');
    const displayName = document.getElementById('unban-username').textContent;

    if (!targetUsername) {
        showToast('Error: No target username found', 'error');
        return;
    }

    try {
        // 1. Find the user in our local array to get the banId we attached earlier
        const userEntry = bannedUsersData.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        
        // 2. Execute the DELETE request
        // We send both the banId (for log cleanup) and targetUsername (for profile update)
        const response = await fetch('/api/ban-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                banId: userEntry ? userEntry.id : null, 
                targetUsername: targetUsername
            })
        });
        
        const result = await response.json();

        if (response.ok) {
            showToast(`Successfully unbanned ${displayName}`, 'success');
            closeUnbanModal();
            // Important: refresh both to keep stats in sync
            await loadBannedUsers(); 
            updateQuickStats();
        } else {
            showToast(result.error || 'Failed to unban user', 'error');
        }
    } catch (error) {
        console.error('Unban error:', error);
        showToast('Connection error. Please check your internet.', 'error');
    }
});
document.getElementById('cancel-unban')?.addEventListener('click', closeUnbanModal);
document.getElementById('cancel-ban')?.addEventListener('click', closeBanModal);

function closeUnbanModal() {
    document.getElementById('unban-modal').style.display = 'none';
}

// Stats and Refresh
function updateQuickStats() {
    const totalReports = reportsData.length;
    const pendingReports = reportsData.filter(r => r.status === 'pending').length;
    const totalBanned = bannedUsersData.length;
    const temporaryBans = bannedUsersData.filter(u => u.banStatus === 'Temporary').length;
    
    document.getElementById('total-reports').textContent = totalReports;
    document.getElementById('pending-reports').textContent = pendingReports;
    document.getElementById('total-banned').textContent = totalBanned;
    document.getElementById('temporary-bans').textContent = temporaryBans;
}

function refreshAllData() {
    showToast('Refreshing dashboard...', 'info');
    loadAllData();
}

// Utility Functions
function formatTimeRemaining(timeRemaining) {
    if (!timeRemaining) return 'Permanent';
    
    const { days, hours, minutes } = timeRemaining;
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function formatDate(dateString) {
    if (dateString === "Unknown") return "Unknown";
    
    // Handle timestamp IDs (numbers)
    if (typeof dateString === 'number') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Handle string dates
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function startCountdownTimers() {
    const countdowns = document.querySelectorAll('.countdown');
    
    countdowns.forEach(countdown => {
        const expiration = countdown.getAttribute('data-expiration');
        if (expiration) {
            updateCountdown(countdown, expiration);
            setInterval(() => updateCountdown(countdown, expiration), 60000);
        }
    });
}

function updateCountdown(element, expirationDate) {
    const now = new Date().getTime();
    const expiration = new Date(expirationDate).getTime();
    const remaining = expiration - now;
    
    if (remaining <= 0) {
        element.textContent = 'Expired';
        element.parentElement.parentElement.classList.add('expired');
        return;
    }
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    element.textContent = formatTimeRemaining({ days, hours, minutes });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add icon based on type
    let icon = '';
    switch(type) {
        case 'success': icon = '✅ '; break;
        case 'error': icon = '❌ '; break;
        case 'info': icon = 'ℹ️ '; break;
        default: icon = '';
    }
    toast.textContent = icon + message;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showReportsError() {
    const container = document.getElementById('reports-list');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Error Loading Reports</h3>
            <p>Failed to load reports. Please try refreshing the page.</p>
            <button onclick="loadReports()" class="admin-btn">🔄 Retry</button>
        </div>
    `;
}

function closeReportModal() {
    // This function exists for consistency but doesn't need to do anything
    // since we don't use a modal for reports anymore
    return;
}

function showBannedError() {
    const container = document.getElementById('banned-users-list');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Error Loading Banned Users</h3>
            <p>Failed to load banned users. Please try refreshing the page.</p>
            <button onclick="loadBannedUsers()" class="admin-btn">🔄 Retry</button>
        </div>
    `;
}
