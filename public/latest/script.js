const apiPath = '/api/news';

async function init() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    if (articleId) {
        loadSingleArticle(articleId);
    } else {
        loadNewsHub();
    }
}

async function loadNewsHub() {
    try {
        const response = await fetch(apiPath);
        const articles = await response.json();
        
        const listContainer = document.getElementById('news-list');
        if (articles.length === 0) {
            listContainer.innerHTML = '<p>No news updates found.</p>';
            return;
        }

        listContainer.innerHTML = articles.map(post => `
            <div class="news-card" onclick="openArticle(${post.id})">
                <div class="meta-info">${new Date(post.created_at).toLocaleDateString()}</div>
                <h2>${post.title}</h2>
                <div class="meta-info">By ${post.author_name}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load news:", err);
    }
}

async function loadSingleArticle(id) {
    document.getElementById('hub-view').classList.add('hidden');
    document.getElementById('article-view').classList.remove('hidden');

    try {
        const response = await fetch(`${apiPath}?id=${id}`);
        const article = await response.json();

        document.getElementById('article-title').innerText = article.title;
        document.getElementById('article-author').innerText = `By ${article.author_name} (${article.author_rank})`;
        document.getElementById('article-date').innerText = new Date(article.created_at).toLocaleDateString();
        document.getElementById('article-content').innerText = article.content;
    } catch (err) {
        document.getElementById('article-content').innerText = "Error loading article.";
    }
}

function openArticle(id) {
    // Updates URL without refreshing the page, then re-runs init
    window.history.pushState({}, '', `?id=${id}`);
    init();
}

function clearArticle() {
    window.history.pushState({}, '', window.location.pathname);
    document.getElementById('article-view').classList.add('hidden');
    document.getElementById('hub-view').classList.remove('hidden');
    loadNewsHub();
}

// Listen for browser back/forward buttons
window.onpopstate = init;

init();