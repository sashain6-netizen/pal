// 1. Get references to elements outside the functions so they are always available
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const container = document.getElementById('results-container');

searchButton.addEventListener('click', performSearch);

// Add "Enter" key support for convenience
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const query = searchInput.value;
    
    if (!query) return;

    container.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(`/find/?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error('Search failed');

        const results = await response.json();

        container.innerHTML = ""; 

        if (!results || results.length === 0) {
            container.innerHTML = "<p>No results found. The search instance might be busy. Try again.</p>";
            return;
        }

        results.forEach((result) => {
            renderResult(
                result.title || "No Title", 
                result.url || "#", 
                result.content || "" 
            );
        });

    } catch (error) {
        console.error("Search Error:", error);
        container.innerHTML = "<p>Error: Could not connect to the search proxy.</p>";
    }
}

function renderResult(title, url, text) {
    const div = document.createElement('div');
    div.className = 'result-item';
    // Clean up the snippet text (remove HTML tags if SearXNG sends them)
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); 
    
    div.innerHTML = `
        <a href="${url}" target="_blank" style="font-weight:bold; display:block; margin-bottom: 2px;">${title}</a>
        <span style="color:green; font-size:0.75rem; display:block; margin-bottom: 5px;">${url}</span>
        <p style="margin: 0; font-size: 0.9rem; color: #333;">${cleanText}</p>
    `;
    container.appendChild(div);
}