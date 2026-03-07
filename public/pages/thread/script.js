const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

async function loadThread() {
    if (!threadId) return window.location.href = '/pages';

    // 1. Fetch thread data AND user session (you might need a /api/me endpoint)
    // For now, let's assume your /api/thread also returns 'currentUser' info 
    // or you fetch it separately.
    const [threadRes, userRes] = await Promise.all([
        fetch(`/api/thread?id=${threadId}`),
        fetch('/api/me') // Create a small worker that returns { username, rank }
    ]);

    const data = await threadRes.json();
    const currentUser = await userRes.json();
    
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

    // 2. Fix the "Can Delete" check
    // We check if current user is the thread author OR an Owner
    const isAuthor = currentUser.username === data.author_username;
    const isOwner = currentUser.rank === "Owner";

    // Remove old button if refreshing
    const oldBtn = document.querySelector('.delete-thread-btn');
    if (oldBtn) oldBtn.remove();

    if (isAuthor || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete Thread";
        deleteBtn.className = "delete-thread-btn";
        deleteBtn.onclick = () => deleteThread(threadId);
        document.querySelector('.thread-header').appendChild(deleteBtn);
    }
}

// 3. Move deleteThread OUTSIDE loadThread so it's globally accessible
async function deleteThread(id) {
    if (!confirm("Are you sure? This will delete all posts in this thread forever!")) return;

    const res = await fetch('/api/delete-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: id })
    });
    const data = await res.json();

    if (data.success) {
        alert("Thread Deleted.");
        window.location.href = "/pages";
    } else {
        alert(data.error || "Failed to delete");
    }
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