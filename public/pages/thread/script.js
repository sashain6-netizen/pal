const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

async function loadThread() {
    if (!threadId) return window.location.href = '/pages';

    const res = await fetch(`/api/thread?id=${threadId}`);
    const data = await res.json();
    
    document.getElementById('thread-title').innerText = data.title;
    const container = document.getElementById('posts-container');

    container.innerHTML = data.posts.map(post => `
        <div class="compact-post-row">
            <span class="rank-tag" style="background: ${post.themeColor}">${post.rank}</span>
            <div class="post-body-inline">
                <span class="author-area">
                    ${post.prefix ? `<span class="prefix">${post.prefix}</span>` : ''}
                    <a href="/users?id=${post.username}" class="author-name">${post.displayName}</a>
                </span>
                <span class="separator">:</span>
                <span class="content">${escapeHTML(post.content)}</span>
            </div>
            <span class="timestamp">${new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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