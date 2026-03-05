async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();

    // Map your HTML IDs to variables
    const nameEl = document.getElementById('display-name');
    const userEl = document.getElementById('display-username');
    const bioEl = document.getElementById('display-bio');
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
        
        // Update the UI with data from KV
        if (nameEl) nameEl.textContent = data.displayName;
        if (userEl) userEl.textContent = `@${data.username}`;
        if (bioEl) bioEl.textContent = data.bio || "No bio yet.";
        
        // Update stats if they exist in your KV data
        if (currencyEl) currencyEl.textContent = data.currency || 0;
        if (xpEl) xpEl.textContent = `${data.xp || 0} XP`;
        
        // Simple XP bar logic (example: 1000 XP per level)
        if (xpBar) {
            const progress = ((data.xp || 0) % 1000) / 10; 
            xpBar.style.width = `${progress}%`;
        }

        document.title = `${data.displayName} • Pal`;

    } catch (err) {
        console.error(err);
        if (nameEl) nameEl.textContent = "User Not Found";
        if (bioEl) bioEl.textContent = "The user you are looking for does not exist.";
    }
}

loadProfile();