const params = new URLSearchParams(window.location.search);
const threadId = params.get('id');

let currentOffset = 0;
const limit = 50;
let currentUser = null;

function generateAvatar(avatarUrl, userColor, username) {
    if (avatarUrl && avatarUrl !== "" && avatarUrl !== "/default-avatar.png") {
        return `<img src="${avatarUrl}" alt="${username}" class="post-avatar">`;
    } else {
        return `
            <div class="post-avatar post-avatar-svg">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                          fill="${userColor}" />
                </svg>
            </div>`;
    }
}

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

        const animType = (post.postAnimation || 'none').toLowerCase();
        const hasAnim = animType !== 'none';
        const animClass = hasAnim ? `post-anim-${animType}` : '';
        const showPremiumBg = post.isPremium && !hasAnim;

        const divineExtras = animType === 'divine'
            ? `<div class="nebula"></div>
            <div class="shooting-star"></div>
            <div class="planet p-orange"></div>`
            : '';

        const canDeletePost = currentUser && (
            currentUser.username === post.username ||
            ["Owner", "Admin", "Moderator", "Staff", "Manager"].includes(currentUser.rank)
        );

        return `
    <div class="compact-post-row ${showPremiumBg ? 'premium-post' : ''} ${animClass}"
        style="--premium-forum-color: ${forumColor};"
        data-animation="${animType}"
        data-post-id="${post.id}">

        ${divineExtras} <span class="rank-tag" style="background: ${baseThemeColor}">${post.rank}</span>
        ${generateAvatar(post.avatar, forumColor, post.username)}

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
            ${canDeletePost ? `
                <button class="delete-post-btn" onclick="deletePost(${post.id})" title="Delete post">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                </button>
            ` : ''}
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

function toggleLoadMoreButton(hasMore) {
    let btn = document.getElementById('load-more-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'load-more-btn';
        btn.className = 'load-more-btn';
        btn.innerText = "Load More";
        btn.onclick = () => loadThread(true);
        const container = document.getElementById('posts-container');
        if (container) container.after(btn);
    }
    btn.style.display = hasMore ? 'block' : 'none';
}

function renderDeleteButton(user, authorUsername) {
    const oldBtn = document.querySelector('.delete-thread-btn');
    if (oldBtn) oldBtn.remove();
    const oldBumpBtn = document.querySelector('.bump-thread-btn');
    if (oldBumpBtn) oldBumpBtn.remove();

    if (!user) return;

    const isAuthor = user.username === authorUsername;
    const isOwner = ["Owner", "Admin", "Moderator"].includes(user.rank);
    const isPremium = !!user.isPremium;

    const header = document.querySelector('.thread-header');

    if (isAuthor || isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete Thread";
        deleteBtn.className = "delete-thread-btn";
        deleteBtn.onclick = () => openDeleteModal(threadId);
        header.appendChild(deleteBtn);
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
                    body: JSON.stringify({ threadId })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Bump failed');

                                if (window.showToast) showToast("Thread bumped! Redirecting...");
                setTimeout(() => window.location.href = '/pages', 1000);
            } catch (err) {
                await window.gameAlert(err.message || "Bump failed", "Error");
                bumpBtn.disabled = false;
                bumpBtn.innerText = "Bump Thread";
            }
        };
        header.appendChild(bumpBtn);
    } else if (isAuthor && !isPremium) {
        const promoBtn = document.createElement('button');
        promoBtn.innerText = "Bump (Premium Only)";
        promoBtn.className = "bump-thread-btn promo-gray";
        promoBtn.style.opacity = "0.6";
        promoBtn.onclick = () => window.location.href = '/premium';
        header.appendChild(promoBtn);
    }
}

async function deletePost(postId) {
    if (!await window.gameConfirm('Are you sure you want to delete this post? This action cannot be undone.', 'Delete Post')) {
        return;
    }

    try {
        const res = await fetch('/api/delete-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId }),
            credentials: 'include'
        });

        if (res.ok) {
            if (window.showToast) showToast("Post deleted successfully!");
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                postElement.style.transition = 'opacity 0.3s ease';
                postElement.style.opacity = '0';
                setTimeout(() => postElement.remove(), 300);
            }
        } else {
            const errData = await res.json();
            await window.gameAlert(errData.error || "Failed to delete post.", "Error");
        }
    } catch (e) {
        console.error(e);
        await window.gameAlert("Error deleting post", "Error");
    }
}

async function postReply() {
    const replyInput = document.getElementById('replyText');
    const content = replyInput.value;
    if (!content.trim()) return;

    try {
        const res = await fetch('/api/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId, content }),
            credentials: 'include'
        });

        if (res.ok) {
            replyInput.value = '';
            if (window.showToast) showToast("Reply posted!");
            loadThread(false);
        } else {
            const errData = await res.json();
            await window.gameAlert(errData.error || "Failed to post reply.", "Error");
        }
    } catch (e) {
        console.error(e);
    }
}

async function openDeleteModal(threadId) {
    if (!await window.gameConfirm('Are you sure you want to delete this thread? This action cannot be undone.', 'Delete Thread')) {
        return;
    }

    try {
        const res = await fetch('/api/delete-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
            credentials: 'include'
        });

        if (res.ok) {
            await window.gameAlert('Thread deleted successfully', 'Success');
            window.location.href = '/pages';
        } else {
            const error = await res.json();
            await window.gameAlert(error.error || 'Failed to delete thread', 'Error');
        }
    } catch (e) {
        console.error('Delete thread error:', e);
        await window.gameAlert('Error deleting thread', 'Error');
    }
}

function escapeHTML(str) {
    if (!str) return "";
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

loadThread();
