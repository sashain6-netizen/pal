async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    try {
        // 1. Fetch Public Data & My Data simultaneously for speed
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        
        // 2. Display Public Info
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;
        document.getElementById('stat-followers').textContent = (data.followersCount || 0).toLocaleString();

        // 3. Avatar & Theme (FIX FOR DEFAULT PROFILE)
        const avatarEl = document.getElementById('display-avatar');
        const avatarWrapper = document.getElementById('avatar-wrapper');
        if (data.avatar && data.avatar !== "/default-avatar.png") {
            if (avatarEl) avatarEl.src = data.avatar;
        } else if (data.themeColor) {
            if (avatarWrapper) {
                avatarWrapper.style.backgroundColor = data.themeColor;
                avatarWrapper.style.borderRadius = "50%";
            }
            if (avatarEl) {
                avatarEl.style.filter = "brightness(0) invert(1)"; 
                avatarEl.src = "/default-avatar.png";
            }
        }

        // 4. Action Button Logic
        if (!meRes.ok) return;
        const myData = await meRes.json();
        const myId = myData.username.toLowerCase();
        const followBtn = document.getElementById('follow-btn');
        const messageBtn = document.getElementById('message-btn');

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
            return;
        }

        // Function to update button UI
        const setFollowState = (isFollowing) => {
            if (isFollowing) {
                followBtn.textContent = "Unfollow";
                followBtn.style.backgroundColor = "#cbd5e1"; // Grey
                followBtn.style.color = "#64748b";
            } else {
                followBtn.textContent = "Follow";
                followBtn.style.backgroundColor = ""; // Back to default CSS blue
                followBtn.style.color = "";
            }
        };

        let isFollowing = myData.following && myData.following.includes(userId);
        setFollowState(isFollowing);

        followBtn.onclick = async () => {
            followBtn.disabled = true;
            // This API should handle both Follow and Unfollow based on current state
            const res = await fetch('/api/follow-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId: userId })
            });

            if (res.ok) {
                isFollowing = !isFollowing;
                setFollowState(isFollowing);
                
                // Update follower count on UI
                const countEl = document.getElementById('stat-followers');
                let count = parseInt(countEl.textContent.replace(/,/g, ''));
                countEl.textContent = (isFollowing ? count + 1 : count - 1).toLocaleString();
            }
            followBtn.disabled = false;
        };

        if (messageBtn) {
            messageBtn.onclick = async () => {
                const msg = prompt(`Send a message to ${data.displayName}:`);
                if (!msg) return;
                await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: userId, from: myData.displayName, text: msg, type: "message" })
                });
                alert("Message sent!");
            };
        }

    } catch (err) {
        console.log("Profile load failed.");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);