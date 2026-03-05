async function loadPublicProfile() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const username = pathSegments[pathSegments.length - 1];

    if (!username || username === "users") {
        window.location.href = "/";
        return;
    }

    try {
        const res = await fetch(`/api/get-user-public?username=${username}`);
        if (!res.ok) throw new Error("User not found");
        const user = await res.json();
        
        // 1. Basic Info
        document.getElementById('display-name').innerText = user.displayName;
        document.getElementById('display-username').innerText = `@${user.username}`;
        document.getElementById('display-bio').innerText = user.bio || "No bio yet.";
        document.getElementById('display-avatar').src = user.avatar || "/default-avatar.png";

        // 2. Stats Grid (Missing in your version)
        document.getElementById('stat-rank').innerText = user.rank || "Member";
        document.getElementById('stat-currency').innerText = (user.currency || 0).toLocaleString();
        document.getElementById('stat-followers').innerText = user.followersCount || 0;
        document.getElementById('stat-following').innerText = user.followingCount || 0;

        // 3. XP Bar Logic (Missing in your version)
        const bar = document.getElementById('xp-bar-fill');
        const xpText = document.getElementById('stat-xp');
        if (bar && xpText) {
            xpText.innerText = `${(user.xp || 0).toLocaleString()} XP`;
            // Basic math for progress bar (Assuming 30k is max for now)
            const percent = Math.min(((user.xp || 0) / 30000) * 100, 100);
            bar.style.width = `${percent}%`;
        }

        // Apply theme color to Follow Button
        const followBtn = document.getElementById('follow-btn');
        if (followBtn && user.themeColor) {
            followBtn.style.backgroundColor = user.themeColor;
        }

    } catch (err) {
        console.error(err);
        const card = document.querySelector('.auth-card');
        if (card) {
            card.innerHTML = `<h1>User Not Found</h1><p>The user "${username}" does not exist.</p><a href="/" class="secondary-link">Back to Home</a>`;
        }
    }
}

// Only call it once when the window loads
window.onload = loadPublicProfile;

loadPublicProfile();

loadPublicProfile();