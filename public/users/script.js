// --- TOAST SYSTEM ---
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
        if (myData) {
        // 1. Update Navbar Avatar
        const navAvatarContainer = document.getElementById('avatar-container');
        if (navAvatarContainer) {
            navAvatarContainer.innerHTML = `<img src="${myData.avatar || '/default-avatar.png'}" alt="Profile">`;
        }

        // 2. Toggle Dropdown Links
        const loggedInLinks = document.getElementById('loggedInLinks');
        const loggedOutLinks = document.getElementById('loggedOutLinks');
        if (loggedInLinks) loggedInLinks.style.display = 'block';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';

        // 3. Setup Logout Logic (if not already handled elsewhere)
        const logoutBtn = document.getElementById('logoutLink');
        if (logoutBtn) {
            logoutBtn.onclick = async (e) => {
                e.preventDefault();
                await fetch('/api/logout', { method: 'POST' });
                window.location.href = '/login';
            };
        }
    }
        

        // Populate User Data
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-followers').textContent = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent = (Array.isArray(data.following) ? data.following.length : 0).toLocaleString();
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;

        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;

        // --- MOVE THESE HERE (Outside the myData check) ---
        const avatarImg = document.getElementById('display-avatar');
        if (avatarImg) {
            // Check if your backend uses 'avatar' or 'avatarUrl'
            avatarImg.src = data.avatar || "/default-avatar.png";
        }
        
        const bioText = document.getElementById('display-bio');
        if (bioText) {
            bioText.textContent = data.bio || "No bio yet.";
        }

        // 3. XP Bar Logic based on Ladder
        const ladder = [
            { name: "Legend", xp: 30000 },
            { name: "Elite", xp: 15000 },
            { name: "Veteran", xp: 7500 },
            { name: "Contributor", xp: 3500 },
            { name: "Supporter", xp: 1500 },
            { name: "Active Member", xp: 500 },
            { name: "Member", xp: 0 }
        ].reverse(); // Reverse so we can find the "next" rank easily

        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const currentXP = data.xp || 0;
            // Find the next rank the user hasn't reached yet
            const nextRank = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);

            if (!nextRank) {
                xpBar.style.width = "100%";
            } else {
                const min = currentRank ? currentRank.xp : 0;
                const max = nextRank.xp;
                const progress = ((currentXP - min) / (max - min)) * 100;
                xpBar.style.width = `${Math.min(progress, 100)}%`;
            }
        }

        if (!myData) {
            if (followBtn) followBtn.style.display = 'none';
            if (messageBtn) messageBtn.style.display = 'none';
            return;
        }

        const myId = myData.username.toLowerCase();

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
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