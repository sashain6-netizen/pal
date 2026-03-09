const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const container = document.getElementById('results-container');

searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const query = searchInput.value;
    if (!query) return;

    container.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(`/find/?q=${encodeURIComponent(query)}`);
        
        // 1. Check if the response is actually JSON
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("The search server is currently busy or blocking the request.");
        }

        const results = await response.json();
        container.innerHTML = ""; 

        if (!results || results.length === 0) {
            container.innerHTML = "<p>No results found. Try a different search term.</p>";
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
        // 2. Give the user a more helpful message
        container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function renderResult(title, url, text) {
    const div = document.createElement('div');
    div.className = 'result-item';
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); 
    
    div.innerHTML = `
        <a href="${url}" target="_blank" style="font-weight:bold; display:block; margin-bottom: 2px;">${title}</a>
        <span style="color:green; font-size:0.75rem; display:block; margin-bottom: 5px;">${url}</span>
        <p style="margin: 0; font-size: 0.9rem; color: #333;">${cleanText}</p>
    `;
    container.appendChild(div);
}