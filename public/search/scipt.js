async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) return;

    resultsDiv.innerHTML = '<div class="searching">Searching...</div>';

    try {
        // We'll call a new endpoint specifically for searching
        const res = await fetch(`/api/search?username=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.exists) {
            resultsDiv.innerHTML = `
                <div class="result-card found">
                    <div class="user-info">
                        <span class="user-avatar">${data.prefix || '👤'}</span>
                        <span class="user-name">${data.username}</span>
                    </div>
                    <a href="/profile/${data.username}" class="nav-btn view-btn">View Profile</a>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `<div class="result-card error">Username not found</div>`;
        }
    } catch (e) {
        resultsDiv.innerHTML = `<div class="result-card error">Search failed. Try again.</div>`;
    }
}

document.getElementById('search-btn').onclick = performSearch;
document.getElementById('search-input').onkeypress = (e) => {
    if (e.key === 'Enter') performSearch();
};