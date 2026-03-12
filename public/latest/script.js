document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');
    let allArticles = []; 
    let isStaffMember = false; // Persistent flag to solve the "first load" issue

    // 1. Listen for Auth
    window.addEventListener('authReady', (e) => {
        const userData = e.detail;
        isStaffMember = ['Owner', 'Admin', 'Moderator'].includes(userData.rank);
        
        if (isStaffMember && adminControls) {
            adminControls.classList.remove('hidden');
        }
        
        // Re-render once we know the rank to show delete buttons
        renderArticles(allArticles);
    });

    // 2. Fetch Articles
    async function fetchNews() {
        try {
            const response = await fetch('/api/news');
            allArticles = await response.json();
            renderArticles(allArticles);
        } catch (err) {
            newsContainer.innerHTML = '<p>Error loading news.</p>';
        }
    }

    // 3. Render function
    function renderArticles(articles) {
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<p>No news yet.</p>';
            return;
        }

        newsContainer.innerHTML = articles.map(art => `
            <div class="article-card" data-id="${art.id}">
                <div class="card-header">
                    <span class="category-badge">${art.category || 'General'}</span>
                    ${isStaffMember ? `<button class="btn-delete" onclick="deletePost(${art.id})">Delete</button>` : ''}
                </div>
                <h2><a href="article/?id=${art.id}">${art.title}</a></h2>
                <div class="meta">
                    By <strong>${art.author_name}</strong> (${art.author_rank}) • 
                    ${new Date(art.created_at).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    // 4. Category Filtering (Updated to pass 'this' for active state)
    window.filterByCategory = (category, btn) => {
        // Handle active button styling
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');

        if (category === 'All') {
            renderArticles(allArticles);
        } else {
            const filtered = allArticles.filter(a => a.category === category);
            renderArticles(filtered);
        }
    };

    // 5. Delete Function
    window.deletePost = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });

        if (res.ok) {
            allArticles = allArticles.filter(a => a.id !== id);
            renderArticles(allArticles); // Re-render to keep list synced
        } else {
            alert("Failed to delete. You might not have permission.");
        }
    };

    fetchNews();
});