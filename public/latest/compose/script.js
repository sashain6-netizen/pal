document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');
    let allArticles = []; // Store articles for filtering

    // 1. Listen for Auth to show Admin Controls
    window.addEventListener('authReady', (e) => {
        const userData = e.detail;
        const isStaff = ['Owner', 'Admin', 'Moderator'].includes(userData.rank);
        
        if (isStaff && adminControls) {
            adminControls.classList.remove('hidden');
        }
        
        // Refresh view to show delete buttons if staff
        renderArticles(allArticles, isStaff);
    });

    // 2. Fetch Articles
    async function fetchNews() {
        try {
            const response = await fetch('/api/news');
            allArticles = await response.json();
            
            // Initial render (rank might not be known yet, authReady will trigger a re-render)
            renderArticles(allArticles, false);
        } catch (err) {
            newsContainer.innerHTML = '<p>Error loading news.</p>';
        }
    }

    // 3. Render function with Category Badge & Delete Button
    function renderArticles(articles, isStaff) {
        if (articles.length === 0) {
            newsContainer.innerHTML = '<p>No news yet.</p>';
            return;
        }

        newsContainer.innerHTML = articles.map(art => `
            <div class="article-card" data-id="${art.id}">
                <div class="card-header">
                    <span class="category-badge">${art.category || 'General'}</span>
                    ${isStaff ? `<button class="btn-delete" onclick="deletePost(${art.id})">Delete</button>` : ''}
                </div>
                <h2><a href="article/?id=${art.id}">${art.title}</a></h2>
                <div class="meta">
                    By <strong>${art.author_name}</strong> (${art.author_rank}) • 
                    ${new Date(art.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    // 4. Category Filtering
    window.filterByCategory = (category) => {
        if (category === 'All') {
            renderArticles(allArticles, !adminControls.classList.contains('hidden'));
        } else {
            const filtered = allArticles.filter(a => a.category === category);
            renderArticles(filtered, !adminControls.classList.contains('hidden'));
        }
    };

    // 5. Delete Function (No token needed, uses cookies)
    window.deletePost = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });

        if (res.ok) {
            allArticles = allArticles.filter(a => a.id !== id);
            document.querySelector(`[data-id="${id}"]`).remove();
        } else {
            alert("Failed to delete. You might not have permission.");
        }
    };

    fetchNews();
});