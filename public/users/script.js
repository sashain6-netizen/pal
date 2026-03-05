async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');

    try {
        // 1. Fetch BOTH at once (Fastest way)
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        
        // 2. Display Public Info immediately
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;
        document.getElementById('stat-followers').textContent = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent = (data.following?.length || 0).toLocaleString();

        // 3. Avatar/Theme Fix (Ensure this isn't default)
        const avatarEl = document.getElementById('display-avatar');
        const avatarWrapper = document.getElementById('avatar-wrapper');
        
        if (data.avatar && data.avatar !== "/default-avatar.png") {
            avatarEl.src = data.avatar;
            avatarEl.style.filter = "none";
            if (avatarWrapper) avatarWrapper.style.backgroundColor = "transparent";
        } else {
            // Apply theme color to the silhouette
            if (avatarWrapper) {
                avatarWrapper.style.backgroundColor = data.themeColor || "#2563eb";
                avatarWrapper.style.borderRadius = "50%";
            }
            if (avatarEl) {
                avatarEl.src = "/default-avatar.png";
                avatarEl.style.filter = "brightness(0) invert(1)"; // White icon
            }
        }

        // 4. Handle Login-Dependent Buttons
        if (!meRes.ok) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
            return;
        }

        const myData = await meRes.json();
        const myId = myData.username.toLowerCase();

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
        } else {
            // Check if already following
            let isFollowing = myData.following && myData.following.includes(userId);
            
            const updateButtonUI = (following) => {
                if (following) {
                    followBtn.textContent = "Unfollow";
                    followBtn.style.backgroundColor = "#cbd5e1"; // Grey
                    followBtn.style.color = "#64748b";
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.backgroundColor = ""; // Default Blue from CSS
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
                    isFollowing = result.following; // Get truth from server
                    updateButtonUI(isFollowing);
                    
                    // Update the number on screen
                    document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
                }
                followBtn.disabled = false;
            };
        }
    } catch (err) {
        console.log("Load failed");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);