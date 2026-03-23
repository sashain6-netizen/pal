document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');
    
    // --- STATE MANAGEMENT ---
    let allArticles = []; 
    let currentOffset = 0;
    let isLoading = false;
    let isStaffMember = false;
    let serverHasMore = false;
    const LIMIT = 10;

    // Format timestamp for consistent display across the platform
    function formatTimestamp(dateString) {
        const postDate = new Date(dateString);
        const now = new Date();
        
        // Compare using local timezone by getting the date parts in local time
        const postDateLocal = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
        const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = postDateLocal.getTime() === nowLocal.getTime();

        if (isToday) {
            return postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return postDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
    }

    // Helper: Prevent XSS by escaping HTML entities
    const escapeHTML = (str) => {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // 1. Listen for Auth
    window.addEventListener('authReady', (e) => {
        const userData = e.detail;
        isStaffMember = ['Owner', 'Admin', 'Moderator'].includes(userData.rank);
        
        if (isStaffMember && adminControls) {
            adminControls.classList.remove('hidden');
        }
        
        // Re-render current articles to show/hide delete buttons based on new auth state
        renderArticles(allArticles, false);
    });

    // 2. Fetch Articles
    async function fetchNews(append = false) {
        if (isLoading) return; // Prevent double-fetching
        if (!append) currentOffset = 0;

        isLoading = true;
        try {
            const response = await fetch(`/api/news?limit=${LIMIT}&offset=${currentOffset}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json(); 
            serverHasMore = data.hasMore; 
            toggleLoadMoreButton(serverHasMore);
            const newArticles = data.articles || [];
            
            allArticles = append ? [...allArticles, ...newArticles] : newArticles;
            renderArticles(newArticles, append);
            
            currentOffset += newArticles.length;
            toggleLoadMoreButton(data.hasMore);
        } catch (err) {
            console.error("Fetch error:", err);
            if (!append) newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
        } finally {
            isLoading = false;
        }
    }

    // 3. Render function
    function renderArticles(articles, append) {
        if (!append && (!articles || articles.length === 0)) {
            newsContainer.innerHTML = '<p>No news yet.</p>';
            return;
        }

        const html = articles.map(art => `
            <div class="article-card" data-id="${art.id}">
                <div class="card-header">
                    <span class="category-badge">${escapeHTML(art.category) || 'General'}</span>
                    ${isStaffMember ? `<button class="btn-delete" data-action="delete">Delete</button>` : ''}
                </div>
                <h2><a href="article/?id=${art.id}">${escapeHTML(art.title)}</a></h2>
                <div class="meta">
                    By <strong>${escapeHTML(art.author_name)}</strong> (${escapeHTML(art.author_rank)}) • 
                    ${formatTimestamp(art.created_at)}
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
            btn.className = 'load-more-btn';
            btn.innerText = "Load More News";
            btn.addEventListener('click', () => fetchNews(true));
            newsContainer.after(btn);
        }
        btn.style.display = hasMore ? 'block' : 'none';
    }

    // 5. Global Event Listener (Event Delegation)
    // This handles all clicks inside the news container for better performance
    newsContainer.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Handle Delete Action
        if (target.dataset.action === 'delete') {
            const card = target.closest('.article-card');
            const id = card.dataset.id;

            if (!confirm("Are you sure you want to delete this post?")) return;

            try {
                const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    allArticles = allArticles.filter(a => a.id != id);
                    card.remove(); // Smoothly remove from DOM without full re-render
                } else {
                    alert("Failed to delete.");
                }
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    });

    // 6. Category Filtering (Updated to work without 'window' scope)
    const filterContainer = document.querySelector('.filter-container'); // Assuming you have one
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;

            const category = e.target.innerText; // Or use a data-category attribute
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const loadMoreBtn = document.getElementById('load-more-news-btn');
            
            if (category === 'All') {
                renderArticles(allArticles, false);
                if (loadMoreBtn) loadMoreBtn.style.display = serverHasMore ? 'block' : 'none';
            } else {
                const filtered = allArticles.filter(a => a.category === category);
                renderArticles(filtered, false);
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
        });
    }

    // Initial Load
    fetchNews();
});