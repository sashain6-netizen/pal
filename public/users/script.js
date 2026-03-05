async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');

    try {
        // 1. Fetch BOTH Public Data and My Data at the same time
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        
        // 2. STATS FIX: Check both "followersCount" and "followers" array length
        const fers = data.followersCount ?? (Array.isArray(data.followers) ? data.followers.length : (data.followers || 0));
        const fing = data.followingCount ?? (Array.isArray(data.following) ? data.following.length : (data.following || 0));

        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-followers').textContent = fers.toLocaleString();
        document.getElementById('stat-following').textContent = fing.toLocaleString();
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;

        // 3. XP BAR FIX: Ensure math doesn't result in NaN
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const currentXp = data.xp || 0;
            const progress = Math.min((currentXp % 1000) / 10, 100); // Assumes 1000 XP per level
            xpBar.style.width = `${progress}%`;
        }

        // 4. AVATAR FIX
        const avatarEl = document.getElementById('display-avatar');
        const avatarWrapper = document.getElementById('avatar-wrapper');
        if (data.avatar && data.avatar !== "/default-avatar.png") {
            if (avatarEl) avatarEl.src = data.avatar;
            if (avatarEl) avatarEl.style.filter = "none";
        } else if (data.themeColor) {
            if (avatarWrapper) avatarWrapper.style.backgroundColor = data.themeColor;
            if (avatarEl) {
                avatarEl.src = "/default-avatar.png";
                avatarEl.style.filter = "brightness(0) invert(1)"; 
            }
        }

        // 5. BLUE BUTTON FIX: Handle the My Data results
        if (!meRes.ok) {
            if (followBtn) followBtn.style.display = 'none';
            return;
        }

        const myData = await meRes.json();
        const myId = myData.username.toLowerCase();

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
        } else {
            // Check if already following to prevent the blue flicker
            let isFollowing = myData.following && myData.following.includes(userId);
            
            const updateButtonUI = (following) => {
                if (following) {
                    followBtn.textContent = "Unfollow";
                    followBtn.style.backgroundColor = "#cbd5e1"; // Grey
                    followBtn.style.color = "#64748b";
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.backgroundColor = ""; // Resets to CSS Blue
                    followBtn.style.color = "";
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
        console.error("Load error:", err);
    }
}
document.addEventListener('DOMContentLoaded', loadProfile);