document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const adminControls = document.getElementById('admin-controls');
    const token = localStorage.getItem('token');
    const userRank = localStorage.getItem('rank');
    const isStaff = ['Owner', 'Admin', 'Moderator'].includes(userRank);

    if (isStaff) {
        adminControls.classList.remove('hidden');
    }

    // 2. Fetch Articles
    async function fetchNews() {
        try {
            const response = await fetch('/api/news');
            const articles = await response.json();
            
            if (articles.length === 0) {
                newsContainer.innerHTML = '<p>No news yet.</p>';
                return;
            }

            newsContainer.innerHTML = articles.map(art => `
                <div class="article-card" data-id="${art.id}">
                    ${isStaff ? `<button class="btn-delete" onclick="deletePost(${art.id})">Delete</button>` : ''}
                    <h2><a href="article/?id=${art.id}">${art.title}</a></h2>
                    <div class="meta">
                        By ${art.author_name} (${art.author_rank}) • 
                        ${new Date(art.created_at).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        } catch (err) {
            newsContainer.innerHTML = '<p>Error loading news.</p>';
        }
    }

    // 3. Delete Function
    window.deletePost = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const res = await fetch(`/api/news?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            document.querySelector(`[data-id="${id}"]`).remove();
        } else {
            alert("Failed to delete. You might not have permission.");
        }
    };

    fetchNews();
});