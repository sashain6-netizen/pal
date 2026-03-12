const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function parseMarkup(text) {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

async function loadArticle() {
    try {
        const res = await fetch(`/api/news?id=${id}`);
        
        if (!res.ok) {
            const contentWrap = document.getElementById('article-content');
            if (contentWrap) contentWrap.innerHTML = "<h1>Article not found.</h1>";
            return;
        }

        const data = await res.json();
        
        // Match IDs exactly to your HTML
        const titleEl = document.getElementById('title');
        const metaEl = document.getElementById('meta');
        const bodyEl = document.getElementById('article-body'); // Changed from 'body' to 'article-body'

        if (titleEl) titleEl.textContent = data.title;
        
        if (metaEl) {
            const date = new Date(data.created_at).toLocaleDateString();
            metaEl.textContent = `By ${data.author_name} (${data.author_rank}) on ${date}`;
        }

        if (bodyEl) {
            bodyEl.innerHTML = parseMarkup(data.content);
        }

    } catch (err) {
        console.error("Error loading article:", err);
    }
}

if (id) {
    loadArticle();
} else {
    window.location.href = '../';
}