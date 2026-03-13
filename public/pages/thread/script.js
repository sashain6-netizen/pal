const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

// --- PAGINATION & CACHING STATE ---
let currentOffset = 0;
const limit = 10;
let currentUser = null; 

async function loadThread(append = false) {
    if (!threadId) return window.location.href = '/pages';

    // If we aren't appending (e.g., initial load or fresh reply), reset
    if (!append) {
        currentOffset = 0;
        const container = document.getElementById('posts-container');
        if (container) container.innerHTML = ''; 
    }

    try {
        // Efficiency: Only fetch 'me' if we don't have it yet
        const fetchTasks = [
            fetch(`/api/thread?id=${threadId}&limit=${limit}&offset=${currentOffset}`)
        ];
        
        if (!currentUser) {
            fetchTasks.push(fetch('/api/me').then(res => res.json()));
        }

        const [threadRes, userData] = await Promise.all(fetchTasks);
        const data = await threadRes.json();
        
        if (userData) currentUser = userData;

        // Update UI
        document.getElementById('thread-title').innerText = data.title;
        const container = document.getElementById('posts-container');

        // Generate HTML for the posts returned in this batch
        const postsHTML = (data.posts || []).map(post => `
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

        // Append to container
        container.insertAdjacentHTML('beforeend', postsHTML);

        // Update tracking
        currentOffset += (data.posts || []).length;

        // Manage Load More button
        toggleLoadMoreButton(data.hasMore);

        // Permission check for delete button (only needs to run on initial load)
        if (!append) {
            renderDeleteButton(currentUser, data.author_username);
        }

    } catch (err) {
        console.error("Load error:", err);
    }
}

// --- NEW UI HELPERS ---

function toggleLoadMoreButton(hasMore) {
    let btn = document.getElementById('load-more-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'load-more-btn';
        btn.className = 'load-more-btn';
        btn.innerText = "Load More";
        btn.onclick = () => loadThread(true);
        // Inserts after the posts container
        document.getElementById('posts-container').after(btn);
    }
    btn.style.display = hasMore ? 'block' : 'none';
}

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

// --- MODAL FUNCTIONS (KEEPING YOURS) ---

function openDeleteModal(id) {
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    modal.classList.add('active');

    confirmBtn.onclick = async () => {
        confirmBtn.innerText = "Deleting...";
        confirmBtn.disabled = true;
        await executeDelete(id);
    };
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

async function executeDelete(id) {
    try {
        const res = await fetch('/api/delete-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId: id })
        });
        
        const data = await res.json();
        if (data.success) {
            window.location.href = "/pages";
        } else {
            alert(data.error);
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.innerText = "Yes, Delete It";
            confirmBtn.disabled = false;
            closeDeleteModal();
        }
    } catch (err) {
        console.error(err);
        closeDeleteModal();
    }
}

// --- HELPERS (KEEPING YOURS) ---

function escapeHTML(str) {
    if (!str) return "";
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

function formatTimestamp(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();

    const isToday = postDate.getUTCFullYear() === now.getUTCFullYear() &&
                    postDate.getUTCMonth() === now.getUTCMonth() &&
                    postDate.getUTCDate() === now.getUTCDate();

    if (isToday) {
        return postDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    } else {
        return postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
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
        // Load fresh (false) to see the new reply at the end
        loadThread(false); 
    } else {
        alert("Failed to post reply.");
    }
}

// Start
loadThread();