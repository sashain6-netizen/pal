let currentTab = 'public';

async function init() {
    loadPublicThreads();
    loadPrivateChats();
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

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
    const res = await fetch('/api/forum');
    const threads = await res.json();
    const container = document.getElementById('thread-list');
    
    container.innerHTML = threads.map(t => `
        <div class="feature-card thread-card" onclick="location.href='/forums/thread?id=${t.id}'">
            <h3>${t.title}</h3>
            <div class="meta-info">
                By <span class="user-mention">@${t.creator_username}</span> • ${new Date(t.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

async function loadPrivateChats() {
    const res = await fetch('/api/my-chats');
    if (!res.ok) return; // User likely not logged in
    const chats = await res.json();
    const container = document.getElementById('chat-list');
    
    container.innerHTML = chats.map(c => `
        <div class="feature-card thread-card" onclick="location.href='/forums/chat?id=${c.id}'">
            <h3>🔒 ${c.room_name}</h3>
            <div class="meta-info">
                Owner: @${c.creator_username}
            </div>
        </div>
    `).join('');
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
    const payload = currentTab === 'public' 
        ? { title: document.getElementById('newTitle').value, content: document.getElementById('newContent').value }
        : { roomName: document.getElementById('roomName').value, invitedUser: document.getElementById('inviteUser').value };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        closeModal();
        currentTab === 'public' ? loadPublicThreads() : loadPrivateChats();
    } else {
        alert("Error creating post. Are you logged in?");
    }
}

init();