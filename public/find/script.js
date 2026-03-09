document.getElementById('search-button').addEventListener('click', performSearch);

async function performSearch() {
    const query = document.getElementById('search-input').value;
    const container = document.getElementById('results-container');
    
    if (!query) return;

    container.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(`/find/?q=${encodeURIComponent(query)}`);
        
        // Check if the worker sent back an error
        if (!response.ok) throw new Error('Search failed');

        // NEW: We are getting JSON now, not text/html
        const results = await response.json();

        container.innerHTML = ""; 

        if (!results || results.length === 0) {
            container.innerHTML = "<p>No results found on this instance. Try again in a moment.</p>";
            return;
        }

        // Loop through the clean JSON data
        results.forEach((result) => {
            renderResult(
                result.title || "No Title", 
                result.url || "#", 
                result.content || "" // SearXNG calls the description 'content'
            );
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error: Could not connect to the search proxy.</p>";
    }
}

// Keep your helper function exactly as it was
function renderResult(title, url, text) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
        <a href="${url}" target="_blank" style="font-weight:bold; display:block;">${title}</a>
        <span style="color:green; font-size:0.8em;">${url}</span>
        <p>${text}</p>
    `;
    container.appendChild(div);
}