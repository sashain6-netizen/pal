async function performSearch() {
    const query = document.getElementById('userQuery').value;
    const resultsArea = document.getElementById('results-area');
    
    if (!query) return;

    resultsArea.innerHTML = "<p>Searching...</p>";

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const users = await res.json();

        if (users.length === 0) {
            showToast("User not found. Redirecting to home...", "error");
            setTimeout(() => window.location.href = "/", 2000);
            return;
        }

        // If there is exactly one perfect match, we could redirect immediately, 
        // but it's safer to show the option as requested.
        resultsArea.innerHTML = "";
        users.forEach(user => {
            resultsArea.innerHTML += `
                <div class="feature-card">
                    <div class="profile-icon" style="margin: 0 auto 15px; width: 60px; height: 60px;">
                        <img src="${user.avatarUrl}">
                    </div>
                    <h3>${user.prefix ? '['+user.prefix+'] ' : ''}${user.displayName}</h3>
                    <p>@${user.username}</p>
                    <a href="/profile/${user.username}" class="nav-btn" style="display:inline-block; text-decoration:none; margin-top:10px;">
                        View Profile
                    </a>
                </div>
            `;
        });

    } catch (e) {
        showToast("Search error", "error");
    }
}

// Allow pressing "Enter" to search
document.getElementById('userQuery').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});