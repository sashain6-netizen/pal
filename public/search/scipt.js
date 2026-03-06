async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (!query) return;

    resultsDiv.innerHTML = '<div class="searching">Searching for user...</div>';

    try {
        const res = await fetch(`/api/search?username=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.exists) {
            resultsDiv.innerHTML = `
                <div class="result-card found">
                    <div class="user-info">
                        <div class="user-icon">👤</div>
                        <div class="user-details">
                            <span class="user-name">${data.username}</span>
                            <span class="user-status">View full profile</span>
                        </div>
                    </div>
                    <a href="/users?id=${data.username}" class="nav-btn view-btn">Visit</a>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `<div class="result-card error">Username not found</div>`;
        }
    } catch (e) {
        resultsDiv.innerHTML = `<div class="result-card error">Search failed. Try again.</div>`;
    }
}

// Ensure the button works immediately
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('search-btn');
    const input = document.getElementById('search-input');
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
});