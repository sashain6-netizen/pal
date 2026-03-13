document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');
    
    // --- PAGINATION STATE ---
    let allArticles = []; 
    let currentOffset = 0;
    const limit = 10;
    let isStaffMember = false;

    // 1. Listen for Auth
    window.addEventListener('authReady', (e) => {
        const userData = e.detail;
        isStaffMember = ['Owner', 'Admin', 'Moderator'].includes(userData.rank);
        
        if (isStaffMember && adminControls) {
            adminControls.classList.remove('hidden');
        }
        
        renderArticles(allArticles, false);
    });

    // 2. Fetch Articles (Updated for Pagination)
    async function fetchNews(append = false) {
        if (!append) currentOffset = 0;

        try {
            const response = await fetch(`/api/news?limit=${limit}&offset=${currentOffset}`);
            const data = await response.json(); // Data is now { articles, hasMore }
            
            const newArticles = data.articles || [];
            
            if (append) {
                allArticles = [...allArticles, ...newArticles];
            } else {
                allArticles = newArticles;
            }

            renderArticles(newArticles, append);
            
            currentOffset += newArticles.length;
            toggleLoadMoreButton(data.hasMore);

        } catch (err) {
            console.error(err);
            if (!append) newsContainer.innerHTML = '<p>Error loading news.</p>';
        }
    }

    // 3. Render function (Updated to support appending)
    function renderArticles(articles, append) {
        if (!append && (!articles || articles.length === 0)) {
            newsContainer.innerHTML = '<p>No news yet.</p>';
            return;
        }

        const html = articles.map(art => `
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

        if (append) {
            newsContainer.insertAdjacentHTML('beforeend', html);
        } else {
            newsContainer.innerHTML = html;
        }
    }

    // 4. Load More Button Helper
    function toggleLoadMoreButton(hasMore) {
        let btn = document.getElementById('load-more-news-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'load-more-news-btn';
            btn.className = 'load-more-btn'; // Uses the same CSS we created earlier
            btn.innerText = "Load More News";
            btn.onclick = () => fetchNews(true);
            newsContainer.after(btn);
        }
        btn.style.display = hasMore ? 'block' : 'none';
    }

    // 5. Category Filtering (Note: This filters the CURRENT loaded articles)
    window.filterByCategory = (category, btn) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if(btn) btn.classList.add('active');

        // Hide Load More while filtering to prevent logic conflicts
        const loadMoreBtn = document.getElementById('load-more-news-btn');
        
        if (category === 'All') {
            renderArticles(allArticles, false);
            if (loadMoreBtn) loadMoreBtn.style.display = 'block';
        } else {
            const filtered = allArticles.filter(a => a.category === category);
            renderArticles(filtered, false);
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    };

    // 6. Delete Function
    window.deletePost = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });

        if (res.ok) {
            allArticles = allArticles.filter(a => a.id !== id);
            renderArticles(allArticles, false);
        } else {
            alert("Failed to delete.");
        }
    };

    fetchNews();
});