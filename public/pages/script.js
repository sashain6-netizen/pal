let currentTab = 'public';
let invitedUsers = []; 
let searchTimeout;

// --- PAGINATION STATE ---
let currentOffset = 0;
const limit = 50; 

async function init() {
    // Initial data load
    loadPublicThreads();
    loadPrivateChats();
}

// --- FORUM DATA LOADING ---
// --- UPDATE: loadPublicThreads ---
async function loadPublicThreads(append = false) {
    const container = document.getElementById('thread-list');
    if (!append) {
        currentOffset = 0;
        container.innerHTML = '<p class="empty-msg">Loading threads...</p>';
    }

    try {
        const res = await fetch(`/api/forum?limit=${limit}&offset=${currentOffset}`, { credentials: 'include' });
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-msg">Please <a href="/login">log in</a> to view the forum.</p>';
            return;
        }

        const data = await res.json();
        const threads = data.threads || [];

        if (!append && threads.length === 0) {
            container.innerHTML = '<p class="empty-msg">No threads yet.</p>';
            toggleLoadMoreButton(false);
            return;
        }

        const threadsHTML = threads.map(t => `
            <div class="feature-card thread-card ${t.is_pinned ? 'pinned' : ''} ${t.isPremium ? 'premium-thread' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 onclick="location.href='/pages/thread?id=${t.id}'">
                        ${t.title}
                        ${t.has_unread ? '<span class="unread-dot" title="New activity!"></span>' : ''}
                    </h3>
                    <div class="thread-controls">
                        <button id="pin-icon-${t.id}" class="pin-btn ${t.is_pinned ? 'active' : ''}" 
                                onclick="togglePin(${t.id}, event)">
                            📌
                        </button>
                        <button id="delete-icon-${t.id}" class="delete-btn" 
                                onclick="deleteThread(${t.id}, '${t.title.replace(/'/g, "\\'")}', event)" 
                                style="display: none; margin-left: 8px; color: #dc2626; background: none; border: none; cursor: pointer; font-size: 16px;">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="meta-info" onclick="location.href='/pages/thread?id=${t.id}'">
                    By <span class="user-mention ${t.isPremium ? 'premium-user-text' : ''}"
                        ${t.isPremium ? `style="--premium-forum-color:${t.forumColor || '#b8860b'}; --premium-glow-alpha:${t.premiumGlowAlpha ?? 0.8}; --premium-glow-color:${t.forumColor || '#ffd700'};"` : ''}>
                        @${t.creator_username} ${t.isPremium ? '⭐' : ''}
                    </span> 
                    • ${formatTimestamp(t.created_at)}
                </div>
            </div>
        `).join('');

        if (!append) container.innerHTML = threadsHTML;
        else container.insertAdjacentHTML('beforeend', threadsHTML);

        currentOffset += threads.length;
        toggleLoadMoreButton(data.hasMore);
        
        // Check for admin permissions and show delete buttons
        checkAdminPermissions();
    } catch (e) { console.error(e); }
}

// --- PINNING LOGIC ---
window.togglePin = async (threadId, event) => {
    event.stopPropagation(); // Prevent opening the thread when clicking the pin
    const btn = document.getElementById(`pin-icon-${threadId}`);
    
    // Optimistic UI update
    btn.classList.toggle('active');

    try {
        const res = await fetch('/api/forum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinThreadId: threadId }),
            credentials: 'include'
        });

        if (res.ok) {
            // Refresh the list to apply sorting (Pins fly to top)
            loadPublicThreads(false);
        } else {
            const data = await res.json();
            await window.gameAlert(data.error || "Login required to pin threads.", "Permission Error");
            loadPublicThreads(false); // Revert UI
        }
    } catch (e) {
        console.error("Pinning error:", e);
        loadPublicThreads(false);
    }
};

// --- PAGINATION HELPER ---
function toggleLoadMoreButton(hasMore) {
    let btn = document.getElementById('load-more-threads-btn');
    const listSection = document.getElementById('public-section');

    if (!btn && listSection) {
        btn = document.createElement('button');
        btn.id = 'load-more-threads-btn';
        btn.className = 'load-more-btn'; 
        btn.innerText = "Load More Threads";
        btn.onclick = () => loadPublicThreads(true);
        listSection.appendChild(btn);
    }
    
    if (btn) {
        btn.style.display = (hasMore && currentTab === 'public') ? 'block' : 'none';
    }
}

// --- TAB SWITCHING ---
function switchTab(tab, e) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (e) e.target.classList.add('active');

    const isPublic = tab === 'public';
    const searchInput = document.getElementById('forumSearch');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.placeholder = isPublic ? "Search public threads..." : "Filter my private chats...";
    searchInput.value = ""; 
    if (searchResults) searchResults.classList.remove('active');
    
    if (!isPublic) {
        loadPrivateChats();
        const btn = document.getElementById('load-more-threads-btn');
        if (btn) btn.style.display = 'none';
    } else {
        loadPublicThreads(false); 
    }

    document.getElementById('public-section').style.display = isPublic ? 'block' : 'none';
    document.getElementById('private-section').style.display = !isPublic ? 'block' : 'none';
    document.getElementById('modalTitle').innerText = isPublic ? 'Create New Thread' : 'Start Private Chat';
}

// --- PRIVATE CHATS ---
// --- UPDATE: loadPrivateChats ---
async function loadPrivateChats() {
    const container = document.getElementById('chat-list');
    try {
        const res = await fetch('/api/my-chats', { credentials: 'include' });
        const chats = await res.json();
        if (!chats || chats.length === 0) {
            container.innerHTML = '<p class="empty-msg">No private chats yet.</p>';
            return;
        }
        container.innerHTML = chats.map(c => `
            <div class="feature-card thread-card" onclick="location.href='/pages/chat?id=${c.id}'">
                <h3>
                    🔒 ${c.room_name || 'Private Group'}
                    ${c.has_unread ? '<span class="unread-dot"></span>' : ''}
                </h3>
                <div class="meta-info">Owner: @${c.creator_username}</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// --- MODAL HANDLING ---
function openModal() {
    document.getElementById('postModal').style.display = 'flex';
    document.getElementById('publicFields').style.display = currentTab === 'public' ? 'block' : 'none';
    document.getElementById('privateFields').style.display = currentTab === 'private' ? 'block' : 'none';
}

function closeModal() {
    document.getElementById('postModal').style.display = 'none';
    invitedUsers = [];
    renderUserTags();
    document.querySelectorAll('#postModal input, #postModal textarea').forEach(i => i.value = '');
    document.getElementById('userSearchResults').style.display = 'none';
}

async function submitPost() {
    const endpoint = currentTab === 'public' ? '/api/forum' : '/api/create-chat';
    let payload;

    if (currentTab === 'public') {
        const title = document.getElementById('newTitle').value;
        const content = document.getElementById('newContent').value;
        if (!title || !content) return await window.gameAlert("Title and Content required!", "Validation Error");
        payload = { title, content };
    } else {
        const roomName = document.getElementById('roomName').value;
        if (invitedUsers.length === 0) return await window.gameAlert("Invite at least one person!", "Validation Error");
        payload = { roomName, invitedUsers };
    }

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (res.ok) {
            closeModal();
            currentTab === 'public' ? loadPublicThreads(false) : loadPrivateChats();
        } else {
            const errData = await res.json();
            await window.gameAlert(`Error: ${errData.error}`, "Error");
        }
    } catch (e) { 
        await window.gameAlert("Server connection failed.", "Connection Error"); 
    }
}

// --- SEARCH LOGIC ---
// --- SEARCH LOGIC ---
async function handleSearch() {
    const query = document.getElementById('forumSearch').value.toLowerCase().trim();
    const forumResultsDiv = document.getElementById('searchResults');
    
    if (currentTab === 'private') {
        const chats = document.querySelectorAll('#chat-list .thread-card');
        chats.forEach(chat => {
            const text = chat.innerText.toLowerCase();
            chat.style.display = text.includes(query) ? 'block' : 'none';
        });
        return; 
    }

    clearTimeout(searchTimeout);
    if (query.length < 2) {
        forumResultsDiv.classList.remove('active');
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`/api/forums-search?q=${encodeURIComponent(query)}`);
            const results = await res.json();
            if (results.length > 0) {
                forumResultsDiv.innerHTML = results.map(t => `
                    <a href="/pages/thread?id=${t.id}" class="search-item">
                        <span class="search-title">${t.title}</span>
                        <span class="search-meta">
                            By <span class="${t.isPremium ? 'premium-user-text' : ''}"
                                ${t.isPremium ? `style="--premium-forum-color:${t.forumColor || '#b8860b'}; --premium-glow-alpha:${t.premiumGlowAlpha ?? 0.8}; --premium-glow-color:${t.forumColor || '#ffd700'};"` : ''}>
                                @${t.creator_username} ${t.isPremium ? '⭐' : ''}
                            </span>
                        </span>
                    </a>`).join('');
                forumResultsDiv.classList.add('active');
            } else {
                forumResultsDiv.innerHTML = '<div class="search-item">No results</div>';
                forumResultsDiv.classList.add('active');
            }
        } catch (e) { console.error("Search failed", e); }
    }, 300);
}

// --- USER INVITE SEARCH ---
async function searchUsersForInvite() {
    const query = document.getElementById('userSearchInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('userSearchResults');
    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    const res = await fetch(`/api/users-search?q=${encodeURIComponent(query)}`);
    const users = await res.json();
    if (users.length > 0) {
        resultsDiv.innerHTML = users
            .filter(u => !invitedUsers.includes(u.username))
            .map(u => `<div class="user-result" onclick="selectUser('${u.username}')">@${u.username}</div>`)
            .join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
}

function selectUser(username) {
    if (!invitedUsers.includes(username)) {
        invitedUsers.push(username);
        renderUserTags();
    }
    document.getElementById('userSearchInput').value = '';
    document.getElementById('userSearchResults').style.display = 'none';
}

function renderUserTags() {
    const container = document.getElementById('selectedUsers');
    if (!container) return;
    container.innerHTML = invitedUsers.map(u => `
        <span class="user-tag">@${u} <span class="remove-tag" onclick="removeUser('${u}')">×</span></span>
    `).join('');
}

function removeUser(username) {
    invitedUsers = invitedUsers.filter(u => u !== username);
    renderUserTags();
}

// --- CLICK-OUTSIDE DISMISSAL ---
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        const sr = document.getElementById('searchResults');
        if (sr) sr.classList.remove('active');
    }
    if (!e.target.closest('.user-search-wrapper')) {
        const uRes = document.getElementById('userSearchResults');
        if (uRes) uRes.style.display = 'none';
    }
});

// --- ADMIN CONTROLS ---
async function checkAdminPermissions() {
    try {
        const res = await fetch('/api/get-profile', { credentials: 'include' });
        if (res.ok) {
            const userData = await res.json();
            const staffRoles = ["Owner", "Admin", "Manager", "Moderator"];
            if (staffRoles.includes(userData.rank)) {
                // Show delete buttons for staff
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.style.display = 'inline-block';
                });
            }
        }
    } catch (e) {
        console.error("Failed to check admin permissions:", e);
    }
}

window.deleteThread = async (threadId, threadTitle, event) => {
    event.stopPropagation();
    
    if (!await window.gameConfirm(`Are you sure you want to delete the thread "${threadTitle}"? This action cannot be undone.`, "Delete Thread")) {
        return;
    }
    
    try {
        const res = await fetch('/api/delete-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
            credentials: 'include'
        });
        
        if (res.ok) {
            showToast("Thread deleted successfully");
            loadPublicThreads(false); // Refresh the thread list
        } else {
            const error = await res.json();
            showToast(error.error || "Failed to delete thread");
        }
    } catch (e) {
        console.error("Delete thread error:", e);
        showToast("Error deleting thread");
    }
};

// Launch!
init();