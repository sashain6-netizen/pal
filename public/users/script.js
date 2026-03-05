async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');

    try {
        // Fetch both datasets simultaneously
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        
        // --- STATS FIX ---
        // Handles both raw numbers and arrays
        const getCount = (val) => Array.isArray(val) ? val.length : (val || 0);
        
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-followers').textContent = getCount(data.followers).toLocaleString();
        document.getElementById('stat-following').textContent = getCount(data.following).toLocaleString();
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;

        // --- XP BAR FIX ---
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            // Logic: XP % 1000 determines progress to the next 'thousand'
            const progress = Math.min(((data.xp || 0) % 1000) / 10, 100);
            xpBar.style.width = `${progress}%`;
        }

        // --- AVATAR & THEME FIX ---
        const avatarEl = document.getElementById('display-avatar');
        const avatarWrapper = document.getElementById('avatar-wrapper');
        if (data.avatar && data.avatar !== "/default-avatar.png") {
            if (avatarEl) {
                avatarEl.src = data.avatar;
                avatarEl.style.filter = "none";
            }
        } else if (data.themeColor) {
            if (avatarWrapper) avatarWrapper.style.backgroundColor = data.themeColor;
            if (avatarEl) {
                avatarEl.src = "/default-avatar.png";
                avatarEl.style.filter = "brightness(0) invert(1)"; // Makes silhouette white
            }
        }

        // --- THE BLUE BUTTON FIX ---
        if (!meRes.ok) {
            if (followBtn) followBtn.style.display = "none";
            return;
        }

        const myData = await meRes.json();
        const myId = myData.username.toLowerCase();

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
        } else {
            // Check if I'm already in the following list
            const myFollowing = Array.isArray(myData.following) ? myData.following : [];
            let isFollowing = myFollowing.includes(userId);
            
            const updateButtonUI = (following) => {
                if (following) {
                    followBtn.textContent = "Unfollow";
                    // Using !important to override the CSS file
                    followBtn.style.setProperty('background-color', '#cbd5e1', 'important');
                    followBtn.style.setProperty('color', '#64748b', 'important');
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.setProperty('background-color', '#2563eb', 'important');
                    followBtn.style.setProperty('color', 'white', 'important');
                }
            };

            updateButtonUI(isFollowing);

            followBtn.onclick = async () => {
                followBtn.disabled = true;
                const res = await fetch('/api/follow-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: userId })
                });

                if (res.ok) {
                    const result = await res.json();
                    updateButtonUI(result.following);
                    document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
                }
                followBtn.disabled = false;
            };
        }
    } catch (err) {
        console.error("Profile load error:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);