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

    } catch (err) {
        console.log("Silent failure: Check console if possible.");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);