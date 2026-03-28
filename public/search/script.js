async function performSearch() {
    const queryInput = document.getElementById('userQuery');
    const resultsArea = document.getElementById('results-area');
    const query = queryInput.value.trim().toLowerCase();

        if (!query) return;

    resultsArea.innerHTML = "<p style='color: var(--blue-soft);'>Searching...</p>";

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const users = await res.json();

        resultsArea.innerHTML = "";

        if (users.length === 0) {
            resultsArea.innerHTML = `
                <div class="feature-card" style="grid-column: 1 / -1; border-color: #ef4444;">
                    <p style="color: #ef4444; font-weight: bold;">User not found</p>
                    <p style="font-size: 0.9rem;">Check the spelling and try again!</p>
                </div>
            `;
            return;
        }

        users.forEach(user => {
            const cardClass = user.isPremium ? "feature-card premium-card-pulse" : "feature-card";
            const iconClass = user.isPremium ? "profile-icon premium-avatar-pulse" : "profile-icon";
            const star = "";
            const nameClass = user.isPremium ? "premium-user-text" : "";

            // Generate avatar content - same logic as users page
            let avatarContent;
            if (user.avatar && user.avatar !== "/default-avatar.png") {
                avatarContent = `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                // Show colored SVG for default avatar, same as users page
                avatarContent = `
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%; height:70%;">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                              fill="${user.themeColor || '#2563eb'}" />
                    </svg>`;
            }

            resultsArea.innerHTML += `
                <div class="${cardClass}">
                    <div class="${iconClass}" style="margin: 0 auto 15px; width: 60px; height: 60px; border-color: ${user.themeColor || 'var(--blue-primary)'}">
                        ${avatarContent}
                    </div>
                    <h3 class="${nameClass}">${user.prefix ? '['+user.prefix+'] ' : ''}${user.displayName}${star}</h3>
                    <p style="color: var(--blue-soft);">@${user.username}</p>
                    <a href="/users?id=${user.username}" class="nav-btn" style="display:inline-block; text-decoration:none; margin-top:15px; font-size: 0.85rem;">
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
