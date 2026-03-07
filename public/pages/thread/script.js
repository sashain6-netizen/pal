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
            <span class="timestamp">${new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
        alert("Failed to post reply. Are you logged in?");
    }
}

loadThread();