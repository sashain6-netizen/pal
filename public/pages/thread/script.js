const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get('id');

async function loadThread() {
    if (!threadId) return window.location.href = '/forums';

    const res = await fetch(`/api/thread?id=${threadId}`);
    const data = await res.json();
    
    document.getElementById('thread-title').innerText = data.title;
    const container = document.getElementById('posts-container');

    container.innerHTML = data.posts.map(post => `
        <div class="post-container" style="--user-theme: ${post.themeColor || '#2563eb'}">
            <div class="post-author">
                <img src="${post.avatarUrl || '/default-avatar.png'}" class="author-avatar">
                <span class="author-rank">${post.rank || 'Member'}</span>
            </div>
            <div class="post-content-area">
                <div class="post-meta">
                    <span class="author-prefix">${post.prefix || ''}</span>
                    <a href="/profile/${post.username}" class="author-name">${post.displayName || post.username}</a>
                </div>
                <div class="post-body">${escapeHTML(post.content)}</div>
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
        body: JSON.stringify({ threadId, content })
    });

    if (res.ok) {
        document.getElementById('replyText').value = '';
        loadThread(); // Refresh posts
    } else {
        alert("Log in to reply!");
    }
}

loadThread();