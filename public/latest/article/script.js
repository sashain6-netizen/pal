const params = new URLSearchParams(window.location.search);
const id = params.get('id');

/**
 * Advanced Markup Parser
 * Processes custom markdown and BBCode-style tags into HTML
 */
function parseMarkup(text) {
    if (!text) return "";
    
    return text
        // 1. Headings: # Heading
        .replace(/^# (.*$)/gim, '<h3>$1</h3>')
        
        // 2. Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        // 3. Italics: *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        // 4. Underline: __text__
        .replace(/__(.*?)__/g, '<u>$1</u>')
        
        // 5. Strikethrough: ~~text~~
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        
        // 6. Inline Code: `text`
        .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.05); padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>')
        
        // 7. Custom Colors: [b]blue[/b] and [r]red[/r]
        .replace(/\[b\](.*?)\[\/b\]/g, '<span style="color: #2563eb; font-weight: 600;">$1</span>')
        .replace(/\[r\](.*?)\[\/r\]/g, '<span style="color: #ff4757; font-weight: 600;">$1</span>')
        
        // 8. Bullet Points: - text (at start of line)
        .replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>')
        
        // 9. New Lines: \n
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
        
        const titleEl = document.getElementById('title');
        const metaEl = document.getElementById('meta');
        const bodyEl = document.getElementById('article-body');

        if (titleEl) titleEl.textContent = data.title;
        
        if (metaEl) {
            const date = new Date(data.created_at).toLocaleDateString();
            // Using innerHTML here in case you want to style the meta later
            metaEl.innerHTML = `By <strong>${data.author_name}</strong> (${data.author_rank}) on ${date}`;
        }

        if (bodyEl) {
            // This now renders all the advanced formatting
            bodyEl.innerHTML = parseMarkup(data.content);
        }

        // Update browser tab title
        document.title = `${data.title} • Pal`;

    } catch (err) {
        console.error("Error loading article:", err);
        const bodyEl = document.getElementById('article-body');
        if (bodyEl) bodyEl.textContent = "An error occurred while loading the content.";
    }
}

if (id) {
    loadArticle();
} else {
    window.location.href = '../';
}