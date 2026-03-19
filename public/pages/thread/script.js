const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

// --- PAGINATION & CACHING STATE ---
let currentOffset = 0;
const limit = 50;
let currentUser = null; 

async function loadThread(append = false) {
    if (!threadId) return window.location.href = '/pages';

    if (!append) {
        currentOffset = 0;
        const container = document.getElementById('posts-container');
        if (container) container.innerHTML = ''; 
    }

    try {
        const fetchTasks = [
            fetch(`/api/thread?id=${threadId}&limit=${limit}&offset=${currentOffset}`)
        ];
        
        if (!currentUser) {
            fetchTasks.push(fetch('/api/me').then(res => res.json()));
        }

        const [threadRes, userData] = await Promise.all(fetchTasks);
        const data = await threadRes.json();
        
        if (userData) currentUser = userData;

        document.getElementById('thread-title').innerText = data.title;
        const container = document.getElementById('posts-container');

        const postsHTML = (data.posts || []).map(post => {
            const baseThemeColor = post.themeColor || "#2563eb"; 
            const forumColor = post.forumColor || baseThemeColor;
            const glowAlpha = (post.premiumGlowAlpha ?? 0.8);

            // REMOVED post.isPremium check here so shop items work for everyone
            const hasAnim = post.postAnimation && post.postAnimation !== 'none';
            const animClass = hasAnim ? `post-anim-${post.postAnimation}` : '';

            return `
        <div class="compact-post-row ${post.isPremium ? 'premium-post' : ''} ${animClass}"
            style="--premium-forum-color: ${forumColor};" 
            data-animation="${post.postAnimation || 'none'}">
            
            <span class="rank-tag" style="background: ${baseThemeColor}">${post.rank}</span>
            
            <div class="post-body-inline">
                <span class="author-area">
                    ${post.prefix ? `<span class="prefix">${post.prefix}</span>` : ''}
                    <a href="/users?id=${post.username}"
                    class="author-name ${post.isPremium ? 'premium-user-text' : ''}"
                    style="--premium-forum-color: ${forumColor}; --premium-glow-alpha: ${glowAlpha};">
                        ${post.displayName} ${post.isPremium ? '⭐' : ''}
                    </a>
                </span>
                <span class="separator">:</span>
                <span class="content-wrap">
                    <span class="content">${escapeHTML(post.content)}</span>
                    ${post.postCaption ? `<span class="post-caption">${escapeHTML(post.postCaption)}</span>` : ''}
                </span>
            </div>
            <span class="timestamp">${formatTimestamp(post.created_at)}</span>
        </div>`;
        }).join('');

        container.insertAdjacentHTML('beforeend', postsHTML);
        currentOffset += (data.posts || []).length;
        toggleLoadMoreButton(data.hasMore);

        if (!append) {
            renderDeleteButton(currentUser, data.author_username);
        }

    } catch (err) {
        console.error("Load error:", err);
    }
}

// --- UI HELPERS ---

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

function renderDeleteButton(user, authorUsername) {
    const oldBtn = document.querySelector('.delete-thread-btn');
    if (oldBtn) oldBtn.remove();
    const oldBumpBtn = document.querySelector('.bump-thread-btn');
    if (oldBumpBtn) oldBumpBtn.remove();

    const isAuthor = user.username === authorUsername;
    const isOwner = ["Owner", "Admin", "Moderator"].includes(user.rank);
    const isPremium = !!user.isPremium;

    if (isAuthor || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete Thread";
        deleteBtn.className = "delete-thread-btn";
        deleteBtn.onclick = () => openDeleteModal(threadId);
        document.querySelector('.thread-header').appendChild(deleteBtn);
    }

    if (isAuthor && isPremium) {
        const bumpBtn = document.createElement('button');
        bumpBtn.innerText = "Bump Thread";
        bumpBtn.className = "bump-thread-btn";
        bumpBtn.onclick = async () => {
            try {
                bumpBtn.disabled = true;
                bumpBtn.innerText = "Bumping...";
                const res = await fetch('/api/bump-thread', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ threadId })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Bump failed');
                if (window.showToast) showToast("Thread bumped to the top!");
                else alert("Thread bumped to the top!");
            } catch (err) {
                console.error(err);
                if (window.showToast) showToast(err.message || "Bump failed");
                else alert(err.message || "Bump failed");
            } finally {
                bumpBtn.disabled = false; 
                bumpBtn.innerText = "Bump Thread";
            }
        };
        document.querySelector('.thread-header').appendChild(bumpBtn);
    } else if (isAuthor && !isPremium) {
        const promoBtn = document.createElement('button');
        promoBtn.innerText = "Bump (Premium Only)";
        promoBtn.className = "bump-thread-btn promo-gray";
        promoBtn.style.opacity = "0.6";
        promoBtn.onclick = () => window.location.href = '/premium';
        document.querySelector('.thread-header').appendChild(promoBtn);
    }
}

// --- MODAL ---

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
            showToast(data.error);
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
        loadThread(false); 
    } else {
        showToast("Failed to post reply.");
    }
}

// Start
loadThread();