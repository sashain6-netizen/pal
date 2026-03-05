async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();

    // Elements - matched to your Edit and Public HTML IDs
    const nameEl = document.getElementById('displayName') || document.getElementById('display-name');
    const userEl = document.getElementById('display-username');
    const bioEl = document.getElementById('bio') || document.getElementById('display-bio');
    const currencyEl = document.getElementById('stat-currency');
    const xpEl = document.getElementById('stat-xp');
    const xpBar = document.getElementById('xp-bar-fill');
    const rankEl = document.getElementById('stat-rank');

    if (!userId) {
        if (nameEl) nameEl.textContent = "No ID Provided";
        return;
    }

    try {
        const response = await fetch(`/api/profile?id=${userId}`);
        if (!response.ok) throw new Error("User not found");
        
        const data = await response.json();
        
        // Helper to handle both Inputs (Edit page) and Spans (Public page)
        const safeSet = (el, value) => {
            if (!el) return;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = value || "";
            } else {
                el.textContent = value || "";
            }
        };

        // FIX: Replaced 'el.tagName' with 'userEl.tagName' to prevent crash
        const usernameDisplay = (userEl && (userEl.tagName === 'INPUT' || userEl.tagName === 'TEXTAREA')) 
            ? data.username 
            : `@${data.username}`;

        safeSet(nameEl, data.displayName);
        safeSet(userEl, usernameDisplay);
        safeSet(bioEl, data.bio || "No bio yet.");
        
        // Update Stats
        if (rankEl) rankEl.textContent = data.rank || "Member";
        if (currencyEl) currencyEl.textContent = (data.currency || 0).toLocaleString();
        if (xpEl) xpEl.textContent = `${(data.xp || 0).toLocaleString()} XP`;
        
        // XP Bar Logic
        if (xpBar) {
            // Based on your 8800 XP, this will show 80% progress to the next 1000
            const progress = ((data.xp || 0) % 1000) / 10; 
            xpBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
        }

        document.title = `${data.displayName || 'User'} • Pal`;

    } catch (err) {
        console.error("Profile Load Error:", err);
        if (nameEl) nameEl.textContent = "User Not Found";
        if (bioEl && bioEl.tagName !== 'TEXTAREA') {
            bioEl.textContent = "The user you are looking for does not exist.";
        }
    }
}

loadProfile();