const toastContainer = document.getElementById('toast-container') || (() => {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
    return tc;
})();

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Helper to create the colored SVG icon
function getColoredSvg(color) {
    return `
        <svg viewBox="0 0 24 24" fill="${color}" style="width: 80%; height: 80%;">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
}

async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');
    const msgModal = document.getElementById('message-modal');
    const modalText = document.getElementById('modal-text');

    try {
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        const myData = meRes.ok ? await meRes.json() : null;

        // 1. Populate Text Data
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-followers').textContent = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent = (Array.isArray(data.following) ? data.following.length : 0).toLocaleString();
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;
        
        if (document.getElementById('display-bio')) {
            document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        }

        // 2. Handle Profile Avatar (SVG or Image)
        const avatarWrapper = document.getElementById('avatar-wrapper'); 
        const avatarImg = document.getElementById('display-avatar');

        if (avatarWrapper) {
            if (data.avatar && data.avatar !== "/default-avatar.png") {
                if (avatarImg) {
                    avatarImg.style.display = 'block';
                    avatarImg.src = data.avatar;
                }
            } else {
                if (avatarImg) avatarImg.style.display = 'none';
                avatarWrapper.style.display = 'flex';
                avatarWrapper.style.alignItems = 'center';
                avatarWrapper.style.justifyContent = 'center';
                avatarWrapper.innerHTML = getColoredSvg(data.themeColor || "#2563eb");
            }
        }

        // 3. Update Navbar (Your Icon) with retry loop
        if (myData) {
            const updateNavbarIcon = () => {
                const navAvatar = document.getElementById('avatar-container');
                if (navAvatar) {
                    if (myData.avatar && myData.avatar !== "/default-avatar.png") {
                        navAvatar.innerHTML = `<img src="${myData.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                    } else {
                        navAvatar.style.display = 'flex';
                        navAvatar.style.alignItems = 'center';
                        navAvatar.style.justifyContent = 'center';
                        navAvatar.innerHTML = getColoredSvg(myData.themeColor || "#2563eb");
                    }
                    document.getElementById('loggedInLinks')?.style.setProperty('display', 'block');
                    document.getElementById('loggedOutLinks')?.style.setProperty('display', 'none');
                    return true;
                }
                return false;
            };

            // Attempt to update navbar immediately, then poll if not found
            if (!updateNavbarIcon()) {
                const navInterval = setInterval(() => {
                    if (updateNavbarIcon()) clearInterval(navInterval);
                }, 100);
                setTimeout(() => clearInterval(navInterval), 3000); // Stop trying after 3s
            }
        }

        // 4. XP Bar Logic
        const ladder = [
            { name: "Legend", xp: 30000 },
            { name: "Elite", xp: 15000 },
            { name: "Veteran", xp: 7500 },
            { name: "Contributor", xp: 3500 },
            { name: "Supporter", xp: 1500 },
            { name: "Active Member", xp: 500 },
            { name: "Member", xp: 0 }
        ].reverse();

        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const currentXP = data.xp || 0;
            const nextRank = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);

            const progress = nextRank 
                ? ((currentXP - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100 
                : 100;
            
            xpBar.style.width = `${Math.min(progress, 100)}%`;
            xpBar.style.backgroundColor = data.themeColor || "#2563eb"; // Color the bar too!
        }

        // 5. Follow/Message Button Logic
        if (!myData || myData.username.toLowerCase() === userId) {
            if (followBtn) followBtn.style.display = 'none';
            if (messageBtn) messageBtn.style.display = 'none';
        } else {
            // --- FOLLOW LOGIC ---
            const myFollowing = Array.isArray(myData.following) ? myData.following : [];
            let currentlyFollowing = myFollowing.some(id => id.toLowerCase() === userId);

            const updateUI = (isFollowing) => {
                if (isFollowing) {
                    followBtn.textContent = "Unfollow";
                    followBtn.style.setProperty('background-color', '#cbd5e1', 'important');
                    followBtn.style.setProperty('color', '#64748b', 'important');
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.setProperty('background-color', '#2563eb', 'important');
                    followBtn.style.setProperty('color', 'white', 'important');
                }
            };

            updateUI(currentlyFollowing);

            followBtn.onclick = async () => {
                followBtn.disabled = true;
                const res = await fetch('/api/follow-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: userId })
                });

                if (res.ok) {
                    const result = await res.json();
                    currentlyFollowing = result.following;
                    updateUI(currentlyFollowing);
                    document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
                    showToast(currentlyFollowing ? `Followed @${data.username}` : `Unfollowed @${data.username}`);
                }
                followBtn.disabled = false;
            };

            // --- MESSAGE MODAL LOGIC ---
            messageBtn.onclick = () => {
                document.getElementById('message-recipient').textContent = `To: ${data.displayName || data.username}`;
                msgModal.style.display = 'flex';
                modalText.focus();
            };

            document.getElementById('modal-close').onclick = () => {
                msgModal.style.display = 'none';
                modalText.value = '';
            };

            document.getElementById('modal-send').onclick = async () => {
                const msg = modalText.value.trim();
                if (!msg) {
                    showToast("Message cannot be empty!");
                    return;
                }

                const sendBtn = document.getElementById('modal-send');
                sendBtn.disabled = true;
                sendBtn.textContent = "Sending...";

                const res = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: userId,
                        from: myData.displayName || myData.username,
                        text: msg,
                        type: "message"
                    })
                });

                if (res.ok) {
                    showToast("Message sent successfully!");
                    msgModal.style.display = 'none';
                    modalText.value = '';
                } else {
                    showToast("Failed to send message.");
                }
                sendBtn.disabled = false;
                sendBtn.textContent = "Send Message";
            };
        }
    } catch (err) {
        console.error("Load error:", err);
    }
}
document.addEventListener('DOMContentLoaded', loadProfile);