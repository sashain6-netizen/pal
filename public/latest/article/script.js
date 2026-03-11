const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Simple Markup Parser (Add more rules as needed)
function parseMarkup(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

async function loadArticle() {
    const res = await fetch(`/api/news?id=${id}`);
    if (!res.ok) {
        document.getElementById('article-content').innerHTML = "<h1>Article not found.</h1>";
        return;
    }
    const data = await res.ok ? await res.json() : null;
    
    document.getElementById('title').textContent = data.title;
    document.getElementById('meta').textContent = `By ${data.author_name} (${data.author_rank}) on ${new Date(data.created_at).toLocaleDateString()}`;
    document.getElementById('body').innerHTML = parseMarkup(data.content);
}

if (id) loadArticle();