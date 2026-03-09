document.getElementById('search-button').addEventListener('click', performSearch);

async function performSearch() {
    const query = document.getElementById('search-input').value;
    const container = document.getElementById('results-container');
    
    if (!query) return;

    container.innerHTML = "<p>Searching...</p>";

    try {
        // We use the slash here to avoid the 308 redirect
        const response = await fetch(`/find/?q=${encodeURIComponent(query)}`);
        const htmlText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        
        // 1. Target the specific 2026 DuckDuckGo Lite result containers
        const resultElements = doc.querySelectorAll('.result'); 

        container.innerHTML = ""; 

        if (resultElements.length === 0) {
            // FALLBACK: If the specific classes aren't found, find any link that's not internal
            const allLinks = doc.querySelectorAll('a');
            let foundSomething = false;

            allLinks.forEach(link => {
                const href = link.getAttribute('href') || "";
                // Filter out DDG internal links and empty links
                if (href.startsWith('http') && !href.includes('duckduckgo.com') && link.innerText.length > 3) {
                    renderResult(link.innerText, href, "");
                    foundSomething = true;
                }
            });

            if (!foundSomething) {
                container.innerHTML = "<p>No results found. It's possible the proxy is being blocked by a security check.</p>";
                console.log("Raw HTML for debugging:", htmlText);
            }
            return;
        }

        // 2. Standard Loop for when the selectors work
        resultElements.forEach((el) => {
            const link = el.querySelector('.result__a'); 
            const snippet = el.querySelector('.result__snippet');
            if (link) {
                renderResult(link.innerText, link.href, snippet ? snippet.innerText : "");
            }
        });

    } catch (error) {
        container.innerHTML = "<p>Error: Could not connect to the search proxy.</p>";
    }

    // Helper function to keep the code clean
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
}