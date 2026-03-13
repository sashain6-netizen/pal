let currentTab = 'public';
let invitedUsers = []; 
let searchTimeout;

// --- PAGINATION STATE ---
let currentOffset = 0;
const limit = 50; 

async function init() {
    loadPublicThreads();
    loadPrivateChats();
}

// --- DATA LOADING ---
// --- 1. Update loadPublicThreads Rendering ---
async function loadPublicThreads(append = false) {
    const container = document.getElementById('thread-list');
    
    if (!append) {
        currentOffset = 0;
        container.innerHTML = '<p class="empty-msg">Loading threads...</p>';
    }

    try {
        const res = await fetch(`/api/forum?limit=${limit}&offset=${currentOffset}`, { credentials: 'include' });
        
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-msg">Please <a href="/login">log in</a>.</p>';
            return;
        }

        const data = await res.json();
        const threads = data.threads || [];

        if (!append && threads.length === 0) {
            container.innerHTML = '<p class="empty-msg">No threads yet.</p>';
            toggleLoadMoreButton(false);
            return;
        }

        // Updated mapping to include the Pin Button
        const threadsHTML = threads.map(t => `
            <div class="feature-card thread-card ${t.is_pinned ? 'pinned' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 onclick="location.href='/pages/thread?id=${t.id}'">${t.title}</h3>
                    <button class="pin-btn ${t.is_pinned ? 'active' : ''}" 
                            onclick="togglePin(${t.id}, event)" 
                            title="${t.is_pinned ? 'Unpin' : 'Pin'} Thread">
                        📌
                    </button>
                </div>
                <div class="meta-info" onclick="location.href='/pages/thread?id=${t.id}'">
                    By <span class="user-mention">@${t.creator_username}</span> • ${new Date(t.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');

        if (!append) {
            container.innerHTML = threadsHTML;
        } else {
            container.insertAdjacentHTML('beforeend', threadsHTML);
        }

        currentOffset += threads.length;
        toggleLoadMoreButton(data.hasMore);

    } catch (e) { 
        console.error(e);
        container.innerHTML = '<p class="empty-msg">Error loading threads.</p>'; 
    }
}

// --- 2. Add the Toggle Pin Function ---
window.togglePin = async (threadId, event) => {
    // Crucial: Stops the click from triggering the thread-card's location change
    event.stopPropagation(); 

    try {
        const res = await fetch('/api/forum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinThreadId: threadId }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            // Re-load the list so that pinned items jump to the top automatically
            loadPublicThreads(false);
        } else {
            alert(data.error || "Failed to toggle pin.");
        }
    } catch (e) {
        console.error("Pinning error:", e);
    }
};

// --- NEW PAGINATION HELPER ---
function toggleLoadMoreButton(hasMore) {
    let btn = document.getElementById('load-more-threads-btn');
    const listSection = document.getElementById('public-section');

    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'load-more-threads-btn';
        btn.className = 'load-more-btn'; // Use your existing CSS class
        btn.innerText = "Load More Threads";
        btn.onclick = () => loadPublicThreads(true);
        listSection.appendChild(btn);
    }
    
    // Only show the button if there is more data AND we are on the public tab
    btn.style.display = (hasMore && currentTab === 'public') ? 'block' : 'none';
}

// --- MODIFIED TAB LOGIC ---
function switchTab(tab, e) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (e) e.target.classList.add('active');

    const isPublic = tab === 'public';
    const searchInput = document.getElementById('forumSearch');
    
    searchInput.placeholder = isPublic ? "Search public threads..." : "Filter my private chats...";
    searchInput.value = ""; 
    
    if (!isPublic) {
        document.querySelectorAll('#chat-list .thread-card').forEach(c => c.style.display = 'block');
        const btn = document.getElementById('load-more-threads-btn');
        if(btn) btn.style.display = 'none';
    } else {
        loadPublicThreads(false); 
    }

    document.getElementById('public-section').style.display = isPublic ? 'block' : 'none';
    document.getElementById('private-section').style.display = !isPublic ? 'block' : 'none';
    document.getElementById('modalTitle').innerText = isPublic ? 'Create New Thread' : 'Start Private Chat';
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

async function handleSearch() {
    const query = document.getElementById('forumSearch').value.toLowerCase().trim();
    const forumResultsDiv = document.getElementById('searchResults');
    
    // TAB: PRIVATE CHATS (Client-side filtering for speed)
    if (currentTab === 'private') {
        const chats = document.querySelectorAll('#chat-list .thread-card');
        let foundAny = false;

        chats.forEach(chat => {
            const chatName = chat.querySelector('h3').innerText.toLowerCase();
            const ownerName = chat.querySelector('.meta-info').innerText.toLowerCase();
            
            if (chatName.includes(query) || ownerName.includes(query)) {
                chat.style.display = 'block';
                foundAny = true;
            } else {
                chat.style.display = 'none';
            }
        });

        // Optional: Hide the dropdown results div since we are filtering the list directly
        forumResultsDiv.classList.remove('active');
        return; 
    }

    // TAB: PUBLIC FORUMS (Server-side search with debounce)
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
                        <span class="search-meta">By ${t.creator_username}</span>
                    </a>`).join('');
                forumResultsDiv.classList.add('active');
            } else {
                forumResultsDiv.innerHTML = '<div class="search-item">No results</div>';
                forumResultsDiv.classList.add('active');
            }
        } catch (e) { console.error("Search failed", e); }
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