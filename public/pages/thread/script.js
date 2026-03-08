const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

async function loadThread() {
    if (!threadId) return window.location.href = '/pages';

    const [threadRes, userRes] = await Promise.all([
        fetch(`/api/thread?id=${threadId}`),
        fetch('/api/me') 
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
        <span class="timestamp">${formatTimestamp(post.created_at)}</span>
    </div>
`).join('');

    // --- PERMISSION CHECK ---
    const isAuthor = currentUser.username === data.author_username;
    const isOwner = currentUser.rank === "Owner";

    const oldBtn = document.querySelector('.delete-thread-btn');
    if (oldBtn) oldBtn.remove();

    if (isAuthor || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete Thread";
        deleteBtn.className = "delete-thread-btn";
        
        // FIX: Change this to call the MODAL function, not the old delete function
        deleteBtn.onclick = () => openDeleteModal(threadId);
        
        document.querySelector('.thread-header').appendChild(deleteBtn);
    }
}

// --- MODAL FUNCTIONS ---
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
            // Reset button if it fails
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

// --- HELPERS ---
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
        loadThread(); 
    } else {
        showToast("Failed to post reply. Are you logged in?");
    }
}

JavaScript
// Inside loadThread(), update the mapping logic:
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
        <span class="timestamp">${formatTimestamp(post.created_at)}</span>
    </div>
`).join('');

// --- ADD THIS TO YOUR HELPERS SECTION ---
function formatTimestamp(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();

    // Check if the date is today
    const isToday = postDate.getDate() === now.getDate() &&
                    postDate.getMonth() === now.getMonth() &&
                    postDate.getFullYear() === now.getFullYear();

    if (isToday) {
        // Return 12-hour time format (e.g., 08:30 PM)
        return postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // Return date format (e.g., 03/05/2026)
        return postDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

loadThread();