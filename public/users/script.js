async function loadPublicProfile() {
    // 1. Get Username from URL
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const username = pathSegments[pathSegments.length - 1];

    if (!username || username === "users") return;

    try {
        // 2. Fetch Data
        const res = await fetch(`/api/get-user-public?username=${username}`);
        if (!res.ok) throw new Error("User not found");
        const user = await res.json();
        
        // 3. Helper to update UI safely
        const ui = (id, val, isSrc = false) => {
            const el = document.getElementById(id);
            if (el) {
                if (isSrc) el.src = val;
                else el.innerText = val;
            }
        };

        // 4. Fill the page
        ui('display-name', user.displayName || user.username);
        ui('display-username', `@${user.username}`);
        ui('display-bio', user.bio || "No bio yet.");
        ui('display-avatar', user.avatar || "/default-avatar.png", true);
        ui('stat-rank', user.rank || "Member");
        ui('stat-currency', (user.currency || 0).toLocaleString());
        ui('stat-followers', user.followersCount || 0);
        ui('stat-following', user.followingCount || 0);

        const bar = document.getElementById('xp-bar-fill');
        if (bar) {
            const percent = Math.min(((user.xp || 0) / 30000) * 100, 100);
            bar.style.width = `${percent}%`;
            ui('stat-xp', `${(user.xp || 0).toLocaleString()} XP`);
        }

    } catch (err) {
        console.error("Diagnostic:", err);
        // FIX FOR LINE 44: Ensure the card exists before touching it
        const card = document.querySelector('.auth-card');
        if (card) {
            card.innerHTML = `<h1>User Not Found</h1><p>The user "${username}" doesn't exist.</p><a href="/">Home</a>`;
        }
    }
}

window.addEventListener('load', loadPublicProfile);