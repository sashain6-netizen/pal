async function performSearch() {
    const input = document.getElementById('search-input');
    const query = input.value.trim();
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
            resultsDiv.innerHTML = `<div class="result-card error">Username "${query}" not found</div>`;
        }
    } catch (e) {
        resultsDiv.innerHTML = `<div class="result-card error">Search failed. Try again.</div>`;
    }
}

// Robust Initialization
function initSearch() {
    const btn = document.getElementById('search-btn');
    const input = document.getElementById('search-input');
    
    if (btn) {
        btn.onclick = performSearch;
    }
    
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') performSearch();
        };
    }
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}