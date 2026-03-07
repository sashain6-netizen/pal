let currentTab = 'public';
let invitedUsers = []; // Track selected usernames for private chats
let searchTimeout;

async function init() {
    loadPublicThreads();
    loadPrivateChats();
}

// --- TAB LOGIC ---
function switchTab(tab, e) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (e) e.target.classList.add('active');

    const isPublic = tab === 'public';
    document.getElementById('public-section').style.display = isPublic ? 'block' : 'none';
    document.getElementById('private-section').style.display = !isPublic ? 'block' : 'none';
    document.getElementById('modalTitle').innerText = isPublic ? 'Create New Thread' : 'Start Private Chat';
}

// --- DATA LOADING ---
async function loadPublicThreads() {
    const container = document.getElementById('thread-list');
    try {
        const res = await fetch('/api/forum', { credentials: 'include' });
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-msg">Please <a href="/login">log in</a>.</p>';
            return;
        }
        const threads = await res.json();
        if (!threads || threads.length === 0) {
            container.innerHTML = '<p class="empty-msg">No threads yet.</p>';
            return;
        }
        container.innerHTML = threads.map(t => `
            <div class="feature-card thread-card" onclick="location.href='/pages/thread?id=${t.id}'">
                <h3>${t.title}</h3>
                <div class="meta-info">
                    By <span class="user-mention">@${t.creator_username}</span> • ${new Date(t.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = '<p class="empty-msg">Error loading threads.</p>'; }
}

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
                <h3>🔒 ${c.room_name || 'Private Group'}</h3>
                <div class="meta-info">Owner: @${c.creator_username}</div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = '<p class="empty-msg">Error loading chats.</p>'; }
}

// --- MODAL & POSTING ---
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
    
    // Build specific payload based on tab
    let payload;
    if (currentTab === 'public') {
        const title = document.getElementById('newTitle').value;
        const content = document.getElementById('newContent').value;
        if (!title || !content) return showToast("Title and Content required!");
        payload = { title, content };
    } else {
        const roomName = document.getElementById('roomName').value;
        if (invitedUsers.length === 0) return showToast("Invite at least one person!");
        payload = { roomName, invitedUsers }; // Sends the ARRAY
    }

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (res.ok) {
            // Reset all inputs
            document.querySelectorAll('#postModal input, #postModal textarea').forEach(i => i.value = '');
            closeModal();
            currentTab === 'public' ? loadPublicThreads() : loadPrivateChats();
        } else {
            const errData = await res.json();
            showToast(`Error: ${errData.error}`);
        }
    } catch (e) { showToast("Server connection failed."); }
}

// --- SEARCH: FORUMS ---
async function handleSearch() {
    const query = document.getElementById('forumSearch').value.trim();
    const resultsDiv = document.getElementById('searchResults');
    clearTimeout(searchTimeout);
    if (query.length < 2) {
        resultsDiv.classList.remove('active');
        return;
    }
    searchTimeout = setTimeout(async () => {
        const res = await fetch(`/api/forums-search?q=${encodeURIComponent(query)}`);
        const results = await res.json();
        if (results.length > 0) {
            resultsDiv.innerHTML = results.map(t => `
                <a href="/pages/thread?id=${t.id}" class="search-item">
                    <span class="search-title">${t.title}</span>
                    <span class="search-meta">By ${t.creator_username}</span>
                </a>`).join('');
            resultsDiv.classList.add('active');
        } else {
            resultsDiv.innerHTML = '<div class="search-item">No results</div>';
            resultsDiv.classList.add('active');
        }
    }, 300);
}

// --- SEARCH: USER INVITES ---
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
        document.getElementById('userSearchInput').focus();
    }
    document.getElementById('userSearchInput').value = '';
    document.getElementById('userSearchResults').style.display = 'none';
}

function renderUserTags() {
    const container = document.getElementById('selectedUsers');
    if(!container) return;
    container.innerHTML = invitedUsers.map(u => `
        <span class="user-tag">@${u} <span class="remove-tag" onclick="removeUser('${u}')">×</span></span>
    `).join('');
}

function removeUser(username) {
    invitedUsers = invitedUsers.filter(u => u !== username);
    renderUserTags();
}

// --- GLOBAL CLICKS ---
document.addEventListener('click', (e) => {
    // Close forum search
    if (!e.target.closest('.search-container')) {
        document.getElementById('searchResults').classList.remove('active');
    }
    // Close user invite search
    if (!e.target.closest('.user-search-wrapper')) {
        const uRes = document.getElementById('userSearchResults');
        if(uRes) uRes.style.display = 'none';
    }
});

init();