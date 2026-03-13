const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

// --- NEW PAGINATION STATE ---
let currentOffset = 0;
const limit = 10;
let currentUser = null; 

async function loadThread(append = false) {
    if (!threadId) return window.location.href = '/pages';

    // If not appending, we are starting fresh (initial load or new reply)
    if (!append) {
        currentOffset = 0;
        document.getElementById('posts-container').innerHTML = ''; 
    }

    try {
        // Efficiency: Only fetch 'me' once
        const fetchTasks = [fetch(`/api/thread?id=${threadId}&limit=${limit}&offset=${currentOffset}`)];
        if (!currentUser) {
            fetchTasks.push(fetch('/api/me').then(res => res.json()));
        }

        const [threadRes, userData] = await Promise.all(fetchTasks);
        const data = await threadRes.json();
        
        if (userData) currentUser = userData;

        document.getElementById('thread-title').innerText = data.title;
        const container = document.getElementById('posts-container');

        // Map posts to HTML
        const postsHTML = data.posts.map(post => `
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
                <span class="timestamp">${formatTimestamp(post.created_at)}</span>
            </div>
        `).join('');

        // IMPORTANT: Use insertAdjacentHTML so we append instead of overwriting
        container.insertAdjacentHTML('beforeend', postsHTML);

        // Update offset for the next "Load More" click
        currentOffset += data.posts.length;

        // Handle Load More button visibility
        toggleLoadMoreButton(data.hasMore);

        // Only run permission check on initial load
        if (!append) {
            renderDeleteButton(currentUser, data.author_username);
        }

    } catch (err) {
        console.error("Load error:", err);
    }
}

// --- NEW HELPER FOR LOAD MORE BUTTON ---
function toggleLoadMoreButton(hasMore) {
    let btn = document.getElementById('load-more-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'load-more-btn';
        btn.className = 'load-more-btn';
        btn.innerText = "Load More";
        btn.onclick = () => loadThread(true);
        document.getElementById('posts-container').after(btn);
    }
    btn.style.display = hasMore ? 'block' : 'none';
}

// --- REFACTORED PERMISSION CHECK ---
function renderDeleteButton(user, authorUsername) {
    const oldBtn = document.querySelector('.delete-thread-btn');
    if (oldBtn) oldBtn.remove();

    const isAuthor = user.username === authorUsername;
    const isOwner = ["Owner", "Admin", "Moderator"].includes(user.rank);

    if (isAuthor || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete Thread";
        deleteBtn.className = "delete-thread-btn";
        deleteBtn.onclick = () => openDeleteModal(threadId);
        document.querySelector('.thread-header').appendChild(deleteBtn);
    }
}

// ... Keep your escapeHTML, formatTimestamp, and Modal functions exactly as they were ...

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
        loadThread(false); // Refresh from top to show the new reply
    } else {
        alert("Failed to post reply.");
    }
}

loadThread();