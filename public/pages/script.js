let currentTab = 'public';

async function init() {
    loadPublicThreads();
    loadPrivateChats();
}

function switchTab(tab, e) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (e) e.target.classList.add('active');

    if (tab === 'public') {
        document.getElementById('public-section').style.display = 'block';
        document.getElementById('private-section').style.display = 'none';
        document.getElementById('modalTitle').innerText = 'Create New Thread';
    } else {
        document.getElementById('public-section').style.display = 'none';
        document.getElementById('private-section').style.display = 'block';
        document.getElementById('modalTitle').innerText = 'Start Private Chat';
    }
}

async function loadPublicThreads() {
    const container = document.getElementById('thread-list');
    try {
        const res = await fetch('/api/forum', { credentials: 'include' });
        
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-msg">Please <a href="/login">log in</a> to view or create threads.</p>';
            return;
        }

        const threads = await res.json();
        if (!threads || threads.length === 0) {
            container.innerHTML = '<p class="empty-msg">No threads yet. Be the first to start a conversation!</p>';
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
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Unable to load threads right now.</p>';
    }
}

async function loadPrivateChats() {
    const container = document.getElementById('chat-list');
    try {
        const res = await fetch('/api/my-chats', { credentials: 'include' });
        
        if (res.status === 401) {
            container.innerHTML = '<p class="empty-msg">Log in to access your private chats.</p>';
            return;
        }

        const chats = await res.json();
        if (!chats || chats.length === 0) {
            container.innerHTML = '<p class="empty-msg">You are not in any private chats yet.</p>';
            return;
        }

        container.innerHTML = chats.map(c => `
            <div class="feature-card thread-card" onclick="location.href='/pages/chat?id=${c.id}'">
                <h3>🔒 ${c.room_name || 'Private Group'}</h3>
                <div class="meta-info">Owner: @${c.creator_username}</div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Error loading chats.</p>';
    }
}

function openModal() {
    document.getElementById('postModal').style.display = 'flex';
    document.getElementById('publicFields').style.display = currentTab === 'public' ? 'block' : 'none';
    document.getElementById('privateFields').style.display = currentTab === 'private' ? 'block' : 'none';
}

function closeModal() {
    document.getElementById('postModal').style.display = 'none';
}

async function submitPost() {
    const endpoint = currentTab === 'public' ? '/api/forum' : '/api/create-chat';
    
    // Get values
    const title = document.getElementById('newTitle').value;
    const content = document.getElementById('newContent').value;
    const roomName = document.getElementById('roomName').value;
    const invitedUser = document.getElementById('inviteUser').value;

    // Basic validation
    if (currentTab === 'public' && (!title || !content)) {
        return showToast("Please fill in both the title and content!");
    }

    const payload = currentTab === 'public' 
        ? { title, content }
        : { roomName, invitedUser };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include' // <--- THIS IS THE FIX
        });

        if (res.ok) {
            // Clear inputs
            document.getElementById('newTitle').value = '';
            document.getElementById('newContent').value = '';
            document.getElementById('roomName').value = '';
            document.getElementById('inviteUser').value = '';
            
            closeModal();
            // Refresh the active tab
            currentTab === 'public' ? loadPublicThreads() : loadPrivateChats();
        } else {
            const errData = await res.json();
            showToast(`Error: ${errData.error || "Are you logged in?"}`);
        }
    } catch (e) {
        console.error("Submission error:", e);
        showToast("Server connection failed.");
    }
}

let searchTimeout;

async function handleSearch() {
    const query = document.getElementById('forumSearch').value.trim();
    const resultsDiv = document.getElementById('searchResults');

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        resultsDiv.classList.remove('active'); // Hides the box and border
        resultsDiv.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`/api/forums-search?q=${encodeURIComponent(query)}`);
            const results = await res.json();

            if (results.length > 0) {
                resultsDiv.innerHTML = results.map(thread => `
                    <a href="/pages/thread?id=${thread.id}" class="search-item">
                        <span class="search-title">${thread.title}</span>
                        <span class="search-meta">Started by ${thread.creator_username}</span>
                    </a>
                `).join('');
                resultsDiv.classList.add('active'); // Shows the box and the border
            } else {
                resultsDiv.innerHTML = '<div class="search-item">No results found</div>';
                resultsDiv.classList.add('active');
            }
        } catch (err) {
            console.error("Search error:", err);
        }
    }, 300);
}

init();