async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    
    // Get basic elements
    const nameEl = document.getElementById('displayName') || document.getElementById('display-name');
    const bioEl = document.getElementById('bio') || document.getElementById('display-bio');

    if (!userId) return;

    try {
        const response = await fetch(`/api/get-user-public?id=${userId}`);
        
        if (!response.ok) return; // Fail silently if user not found

        const data = await response.json(); // Read JSON only ONCE
        
        if (!data.username) return;

        // 1. Core Info
        if (nameEl) nameEl.textContent = data.displayName || data.username;
        if (bioEl) bioEl.textContent = data.bio || "No bio yet.";

        // 2. Username
        const userEl = document.getElementById('username') || document.getElementById('display-username');
        if (userEl) userEl.textContent = `@${data.username}`;

        // 3. Rank
        const rankEl = document.getElementById('rank') || document.getElementById('display-rank');
        if (rankEl) rankEl.textContent = data.rank || "Member";

        // 4. Stats (Numbers)
        const xpEl = document.getElementById('xp') || document.getElementById('display-xp');
        if (xpEl) xpEl.textContent = (data.xp || 0).toLocaleString();

        const currencyEl = document.getElementById('currency') || document.getElementById('display-currency');
        if (currencyEl) currencyEl.textContent = (data.currency || 0).toLocaleString();

        const followersEl = document.getElementById('followers') || document.getElementById('display-followers');
        if (followersEl) followersEl.textContent = (data.followersCount || data.followers || 0).toLocaleString();

        // 5. Avatar
        const avatarEl = document.getElementById('avatar') || document.getElementById('display-avatar');
        if (avatarEl) {
            avatarEl.src = data.avatar || data.avatarUrl || "/default-avatar.png";
        }

    } catch (err) {
        // No error messages will show on the screen
        console.log("Profile load failed.");
    }
}

// Call it once when the script loads
document.addEventListener('DOMContentLoaded', loadProfile);