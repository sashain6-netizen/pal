async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();

    // Elements - double check these match your HTML exactly!
    const nameEl = document.getElementById('displayName') || document.getElementById('display-name');
    const userEl = document.getElementById('display-username');
    const bioEl = document.getElementById('bio') || document.getElementById('display-bio');
    const currencyEl = document.getElementById('stat-currency');
    const xpEl = document.getElementById('stat-xp');
    const xpBar = document.getElementById('xp-bar-fill');

    if (!userId) {
        if (nameEl) nameEl.textContent = "User Not Found";
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
                el.value = value;
            } else {
                el.textContent = value;
            }
        };

        safeSet(nameEl, data.displayName);
        safeSet(userEl, el.tagName === 'INPUT' ? data.username : `@${data.username}`);
        safeSet(bioEl, data.bio || "No bio yet.");
        
        if (currencyEl) currencyEl.textContent = (data.currency || 0).toLocaleString();
        if (xpEl) xpEl.textContent = `${(data.xp || 0).toLocaleString()} XP`;
        
        if (xpBar) {
            const progress = ((data.xp || 0) % 1000) / 10; 
            xpBar.style.width = `${progress}%`;
        }

        document.title = `${data.displayName} • Pal`;

    } catch (err) {
        console.error(err);
        if (nameEl) nameEl.textContent = "User Not Found";
    }
}