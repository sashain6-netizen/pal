async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) return;

    resultsDiv.innerHTML = '<div class="searching">Searching...</div>';

    try {
        const res = await fetch(`/api/search?username=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.exists) {
            // Updated link to /users?id=[username]
            resultsDiv.innerHTML = `
                <div class="result-card found">
                    <div class="user-info">
                        <span class="user-avatar">${data.prefixLabel || '👤'}</span>
                        <div class="user-details">
                            <span class="user-name">${data.username}</span>
                            <span class="user-status">Member Found</span>
                        </div>
                    </div>
                    <a href="/users?id=${data.username}" class="nav-btn view-btn">View Profile</a>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="result-card error">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Username not found
                </div>`;
        }
    } catch (e) {
        resultsDiv.innerHTML = `<div class="result-card error">Search failed. Try again.</div>`;
    }
}