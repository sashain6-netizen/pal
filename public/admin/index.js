let reportsData = [];
let bannedUsersData = [];
let filteredReports = [];
let filteredBannedUsers = [];
let currentTab = 'reports';

// Load all data on page load
document.addEventListener('DOMContentLoaded', loadAllData);

async function loadAllData() {
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
    
    // Sort reports: pending first, then resolved, then deleted
    const sortedReports = [...filteredReports].sort((a, b) => {
        const statusOrder = { 'pending': 0, 'resolved': 1, 'deleted': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    
    const reportsHTML = sortedReports.map(report => {
        const statusClass = report.status === 'pending' ? 'pending' : 
                           report.status === 'resolved' ? 'resolved' : 'deleted';
        const statusText = report.status.charAt(0).toUpperCase() + report.status.slice(1);
        const isResolved = report.status === 'resolved';
        
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
                            <button onclick="viewReportDetails('${report.id}')" class="admin-btn primary-btn">
                                📋 View Report
                            </button>
                        ` : `
                            <a href="/users?id=${escapeHTML(report.reportedUsername)}" class="admin-btn user-link-btn" target="_blank">
                                👤 View User
                            </a>
                            ${report.status === 'pending' ? `
                                <button onclick="resolveReport('${report.id}')" class="admin-btn success-btn">
                                    ✅ Resolve
                                </button>
                            ` : ''}
                            ${report.status !== 'deleted' ? `
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
        
        // Check if current user can unban this user
        const rankHierarchy = { 
    "Owner": 3, "Admin": 2, "Manager": 2, "Moderator": 1, "Staff": 0,
    "Legend": -1, "Elite": -2, "Veteran": -3, "Contributor": -4, 
    "Supporter": -5, "Active Member": -6, "Member": -7 
};
        const canUnban = myRank === "Owner" ? 
            (user.rank !== "Owner") : // Owners can unban anyone except other Owners
            (rankHierarchy[user.rank] < rankHierarchy[myRank]); // Non-Owners can only unban lower ranks
        
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
                    <a href="/users?id=${user.username}" class="admin-btn secondary-btn" target="_blank">
                        👁️ View Profile
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
    
    renderBannedUsers();
}

// Report Actions
function viewReportDetails(reportId) {
    const report = reportsData.find(r => r.id === reportId);
    if (!report) return;
    
    showToast(`Report #${report.id} - ${report.reason} by ${report.reporterUsername}`, 'info');
}

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

// Unban Actions
function showUnbanModal(username, displayName) {
    document.getElementById('unban-username').textContent = displayName;
    document.getElementById('unban-modal').style.display = 'flex';
}

document.getElementById('confirm-unban')?.addEventListener('click', async () => {
    const username = document.getElementById('unban-username').textContent;
    
    try {
        const user = bannedUsersData.find(u => u.displayName === username);
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        const banId = `ban_${user.username}_${Date.now()}`;
        
        const response = await fetch('/api/ban-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                banId: banId,
                targetUsername: user.username
            })
        });
        
        if (response.ok) {
            showToast(`Successfully unbanned ${username}`, 'success');
            closeUnbanModal();
            loadBannedUsers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to unban user', 'error');
        }
    } catch (error) {
        console.error('Unban error:', error);
        showToast('Failed to unban user', 'error');
    }
});

// Modal Management
document.getElementById('cancel-unban')?.addEventListener('click', closeUnbanModal);

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
    
    const date = new Date(dateString);
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
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
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
