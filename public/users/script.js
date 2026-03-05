async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    
    if (!userId) return;

    try {
        const response = await fetch(`/api/get-user-public?id=${userId}`);
        if (!response.ok) return;

        const data = await response.json();
        if (!data.username) return;

        // 1. Name & Bio
        const nameEl = document.getElementById('display-name');
        if (nameEl) nameEl.textContent = data.displayName || data.username;

        const bioEl = document.getElementById('display-bio');
        if (bioEl) bioEl.textContent = data.bio || "No bio yet.";

        // 2. Username
        const userEl = document.getElementById('display-username');
        if (userEl) userEl.textContent = `@${data.username}`;

        // 3. Rank
        const rankEl = document.getElementById('stat-rank');
        if (rankEl) rankEl.textContent = data.rank || "Member";

        // 4. Currency
        const currencyEl = document.getElementById('stat-currency');
        if (currencyEl) currencyEl.textContent = (data.currency || 0).toLocaleString();

        // 5. Followers & Following
        const followersEl = document.getElementById('stat-followers');
        if (followersEl) {
            const count = data.followersCount !== undefined ? data.followersCount : (data.followers || 0);
            followersEl.textContent = count.toLocaleString();
        }

        const followingEl = document.getElementById('stat-following');
        if (followingEl) {
            const fCount = data.followingCount !== undefined ? data.followingCount : (data.following?.length || 0);
            followingEl.textContent = fCount.toLocaleString();
        }

        // 6. XP
        const xpEl = document.getElementById('stat-xp');
        if (xpEl) xpEl.textContent = `${(data.xp || 0).toLocaleString()} XP`;

       // 7. Avatar & Theme Logic
        const avatarEl = document.getElementById('display-avatar');
        const avatarWrapper = document.getElementById('avatar-wrapper');

        if (data.avatar && data.avatar !== "/default-avatar.png") {
            // If they uploaded a real photo, show it
            if (avatarEl) avatarEl.src = data.avatar;
        } else if (data.themeColor) {
            // If using the default "man" icon, apply the theme color
            // We can use a CSS filter to color the default gray icon, 
            // or set the background color of the wrapper.
            if (avatarWrapper) {
                avatarWrapper.style.backgroundColor = data.themeColor;
                avatarWrapper.style.borderRadius = "50%"; // Make it a circle
                avatarWrapper.style.padding = "5px";
            }
            
            // If your default-avatar.png is a transparent 'man' silhouette:
            if (avatarEl) {
                avatarEl.style.filter = "brightness(0) invert(1)"; // Makes the man white
                avatarEl.src = "/default-avatar.png";
            }
        }

        // 8. XP Bar Logic (Bonus)
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar && data.xp) {
            // Logic: Assume 10,000 XP is a level up for visual progress
            const percentage = Math.min((data.xp % 10000) / 100, 100); 
            xpBar.style.width = `${percentage}%`;
        }

        // --- Inside your loadProfile function ---

// Get current user session info to see who "I" am
const meRes = await fetch('/api/get-profile');
const myData = await meRes.json();
const myId = myData.username.toLowerCase();

const followBtn = document.getElementById('follow-btn');
const messageBtn = document.getElementById('message-btn');

if (myId === userId) {
    // Hide or disable buttons if I am looking at my own public profile
    if (followBtn) followBtn.style.display = "none";
    if (messageBtn) messageBtn.style.display = "none";
} else {
    // MESSAGE LOGIC
    if (messageBtn) {
        messageBtn.onclick = async () => {
            const msg = prompt(`Send a message to ${data.displayName}:`);
            if (!msg) return;

            const res = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId: userId, // The person being viewed
                    from: myData.displayName,
                    text: msg,
                    type: "message"
                })
            });

            if (res.ok) alert("Message sent!");
        };
    }

    // FOLLOW LOGIC
    if (followBtn) {
        followBtn.onclick = async () => {
            // Logic to add to your "following" list and their "notifications"
            const res = await fetch('/api/follow-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId: userId })
            });
            if (res.ok) {
                followBtn.textContent = "Following";
                followBtn.disabled = true;
            }
        };
    }
}

    } catch (err) {
        console.log("Silent failure: Check console if possible.");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);