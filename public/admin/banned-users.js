let bannedUsersData = [];
let filteredUsers = [];

// Load banned users on page load
document.addEventListener('DOMContentLoaded', loadBannedUsers);

async function loadBannedUsers() {
    try {
        const response = await fetch('/api/banned-users');
        if (!response.ok) {
            throw new Error('Failed to fetch banned users');
        }
        
        const data = await response.json();
        bannedUsersData = data.bannedUsers || [];
        filteredUsers = [...bannedUsersData];
        
        updateStats();
        renderBannedUsers();
    } catch (error) {
        console.error('Error loading banned users:', error);
        showToast('Failed to load banned users', 'error');
        showErrorState();
    }
}

function updateStats() {
    const totalBanned = bannedUsersData.length;
    const temporaryBans = bannedUsersData.filter(user => user.banStatus === 'Temporary').length;
    const permanentBans = bannedUsersData.filter(user => user.banStatus === 'Permanent').length;
    
    document.getElementById('total-banned').textContent = totalBanned;
    document.getElementById('temporary-bans').textContent = temporaryBans;
    document.getElementById('permanent-bans').textContent = permanentBans;
}

function renderBannedUsers() {
    const container = document.getElementById('banned-users-list');
    
    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚫</div>
                <h3>No banned users found</h3>
                <p>${bannedUsersData.length === 0 ? 'No users are currently banned' : 'No users match your search criteria'}</p>
            </div>
        `;
        return;
    }
    
    const usersHTML = filteredUsers.map(user => {
        const timeDisplay = formatTimeRemaining(user.timeRemaining);
        const banStatusClass = user.banStatus === 'Permanent' ? 'permanent' : 'temporary';
        
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
                    <button onclick="showUnbanModal('${user.username}', '${user.displayName}')" class="admin-btn unban-btn">
                        ✅ Unban
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = usersHTML;
    
    // Start countdown timers
    startCountdownTimers();
}

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
            setInterval(() => updateCountdown(countdown, expiration), 60000); // Update every minute
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

// Search and filter functionality
document.getElementById('search-input')?.addEventListener('input', filterUsers);
document.getElementById('filter-select')?.addEventListener('change', filterUsers);

function filterUsers() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-select').value;
    
    filteredUsers = bannedUsersData.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) ||
                            user.displayName.toLowerCase().includes(searchTerm);
        
        const matchesFilter = filterType === 'all' ||
                            (filterType === 'temporary' && user.banStatus === 'Temporary') ||
                            (filterType === 'permanent' && user.banStatus === 'Permanent');
        
        return matchesSearch && matchesFilter;
    });
    
    renderBannedUsers();
}

// Unban functionality
function showUnbanModal(username, displayName) {
    document.getElementById('unban-username').textContent = displayName;
    document.getElementById('unban-modal').style.display = 'flex';
}

document.getElementById('confirm-unban')?.addEventListener('click', async () => {
    const username = document.getElementById('unban-username').textContent;
    
    try {
        // Get the most recent ban for this user
        const user = bannedUsersData.find(u => u.displayName === username);
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        // Find the ban ID (we'd need to enhance the API to include this)
        // For now, we'll use the username as the ban ID
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
            refreshBannedUsers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to unban user', 'error');
        }
    } catch (error) {
        console.error('Unban error:', error);
        showToast('Failed to unban user', 'error');
    }
});

document.getElementById('cancel-unban')?.addEventListener('click', closeUnbanModal);

function closeUnbanModal() {
    document.getElementById('unban-modal').style.display = 'none';
}

// Refresh functionality
function refreshBannedUsers() {
    showToast('Refreshing banned users...', 'info');
    loadBannedUsers();
}

// Utility functions
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

function showErrorState() {
    const container = document.getElementById('banned-users-list');
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Error Loading Data</h3>
            <p>Failed to load banned users. Please try refreshing the page.</p>
            <button onclick="loadBannedUsers()" class="admin-btn">🔄 Retry</button>
        </div>
    `;
}
