const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

async function loadThread() {
    if (!threadId) return window.location.href = '/forums';

    const res = await fetch(`/api/thread?id=${threadId}`);
    const data = await res.json();
    
    document.getElementById('thread-title').innerText = data.title;
    const container = document.getElementById('posts-container');

    container.innerHTML = data.posts.map(post => `
        <div class="post-card feature-card" style="border-left: 5px solid ${post.themeColor}">
            <div class="post-sidebar">
                <img src="${post.avatarUrl}" class="post-avatar">
                <span class="post-author">${post.displayName}</span>
            </div>
            <div class="post-main">
                <div class="post-date">${new Date(post.created_at).toLocaleString()}</div>
                <div class="post-content">${escapeHTML(post.content)}</div>
            </div>
        </div>
    `).join('');
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

async function postReply() {
    const content = document.getElementById('replyText').value;
    if (!content.trim()) return;

    const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, content }),
        credentials: 'include'
    });

    if (res.ok) {
        document.getElementById('replyText').value = '';
        loadThread(); // Refresh
    } else {
        alert("Failed to post reply. Are you logged in?");
    }
}

loadThread();