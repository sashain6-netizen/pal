async function loadThreads() {
    const list = document.getElementById('thread-list');
    const res = await fetch('/api/forum');
    const threads = await res.json();

    list.innerHTML = threads.map(t => `
        <div class="feature-card thread-item" onclick="location.href='/forums/thread?id=${t.id}'">
            <div class="thread-info">
                <h3>${t.title}</h3>
                <p>Started by <span class="user-mention">@${t.creator_username}</span></p>
            </div>
            <div class="thread-meta">
                ${new Date(t.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}