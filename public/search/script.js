async function performSearch() {
    const queryInput = document.getElementById('userQuery');
    const resultsArea = document.getElementById('results-area');
    const query = queryInput.value.trim().toLowerCase();
    
    if (!query) return;

    resultsArea.innerHTML = "<p style='color: var(--blue-soft);'>Searching...</p>";

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const users = await res.json();

        // Clear the area for the new result
        resultsArea.innerHTML = "";

        if (users.length === 0) {
            // No redirect, just a simple message
            resultsArea.innerHTML = `
                <div class="feature-card" style="grid-column: 1 / -1; border-color: #ef4444;">
                    <p style="color: #ef4444; font-weight: bold;">User not found</p>
                    <p style="font-size: 0.9rem;">Check the spelling and try again!</p>
                </div>
            `;
            return;
        }

        // Show the exact match
        users.forEach(user => {
            resultsArea.innerHTML += `
                <div class="feature-card">
                    <div class="profile-icon" style="margin: 0 auto 15px; width: 60px; height: 60px; border-color: ${user.themeColor || 'var(--blue-primary)'}">
                        <img src="${user.avatarUrl || '/default-avatar.png'}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
                    </div>
                    <h3>${user.prefix ? '['+user.prefix+'] ' : ''}${user.displayName}</h3>
                    <p style="color: var(--blue-soft);">@${user.username}</p>
                    <a href="/profile/${user.username}" class="nav-btn" style="display:inline-block; text-decoration:none; margin-top:15px; font-size: 0.85rem;">
                        View Profile
                    </a>
                </div>
            `;
        });

    } catch (e) {
        resultsArea.innerHTML = "<p style='color: #ef4444;'>Search currently unavailable.</p>";
    }
}

document.getElementById('userQuery').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});