document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');

    let allArticles = [];
    let currentOffset = 0;
    let isLoading = false;
    let isStaffMember = false;
    let serverHasMore = false;
    const LIMIT = 10;

    const escapeHTML = (str) => {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    window.addEventListener('authReady', (e) => {
        const userData = e.detail;
        isStaffMember = ['Owner', 'Admin', 'Moderator'].includes(userData.rank);

                if (isStaffMember && adminControls) {
            adminControls.classList.remove('hidden');
        }

        renderArticles(allArticles, false);
    });

    async function fetchNews(append = false) {
        if (isLoading) return;
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

    newsContainer.addEventListener('click', async (e) => {
        const target = e.target;

        if (target.dataset.action === 'delete') {
            const card = target.closest('.article-card');
            const id = card.dataset.id;

            if (!await window.gameConfirm("Are you sure you want to delete this post?", "Delete Post")) return;

            try {
                const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    allArticles = allArticles.filter(a => a.id != id);
                    card.remove();
                } else {
                    await window.gameAlert("Failed to delete.", "Delete Error");
                }
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    });

    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;

            const category = e.target.innerText;
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

    fetchNews();
});
