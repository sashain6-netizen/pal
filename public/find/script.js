document.getElementById('search-button').addEventListener('click', performSearch);

async function performSearch() {
    const query = document.getElementById('search-input').value;
    const container = document.getElementById('results-container');
    
    if (!query) return;

    container.innerHTML = "<p>Searching...</p>";

    try {
        // Point this to your Cloudflare Worker URL or /find route
        const response = await fetch(`/find?q=${encodeURIComponent(query)}`);
        const htmlText = await response.text();

        // Use DOMParser to turn the string into a readable document
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        
        // DuckDuckGo Lite uses '.result-link' for titles
        const links = doc.querySelectorAll('.result-link');
        const snippets = doc.querySelectorAll('.result-snippet');

        container.innerHTML = ""; // Clear "Searching..."

        if (links.length === 0) {
            container.innerHTML = "<p>No results found.</p>";
            return;
        }

        links.forEach((link, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <a href="${link.href}" target="_blank">${link.innerText}</a>
                <p>${snippets[index] ? snippets[index].innerText : ''}</p>
            `;
            container.appendChild(resultItem);
        });

    } catch (error) {
        container.innerHTML = "<p>Error fetching results. Try again later.</p>";
    }
}