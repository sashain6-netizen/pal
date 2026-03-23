/**
 * Advanced Markup Parser
 */
function parseMarkup(text) {
    if (!text) return "";
    return text
        .replace(/^# (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.05); padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>')
        .replace(/\[b\](.*?)\[\/b\]/g, '<span style="color: #2563eb; font-weight: 600;">$1</span>')
        .replace(/\[r\](.*?)\[\/r\]/g, '<span style="color: #ff4757; font-weight: 600;">$1</span>')
        .replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>')
        .replace(/\n/g, '<br>');
}

const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const previewTitle = document.getElementById('preview-title');
const previewBody = document.getElementById('article-body'); // UPDATED TO MATCH HTML
const previewHr = document.getElementById('preview-hr');

// Handle Live Preview
function updatePreview() {
    const titleVal = titleInput.value.trim();
    const contentVal = contentInput.value;

    previewTitle.textContent = titleVal;
    previewBody.innerHTML = parseMarkup(contentVal);

    // Show horizontal line only if there is content or title
    previewHr.style.display = (titleVal || contentVal) ? 'block' : 'none';
}

titleInput.addEventListener('input', updatePreview);
contentInput.addEventListener('input', updatePreview);

// Handle Submission
document.getElementById('submit-btn').addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = document.getElementById('category').value;
    const btn = document.getElementById('submit-btn');

    if (!title || !content) {
        await window.gameAlert("Please fill in both the title and content.", "Validation Error");
        return;
    }

    btn.innerText = "Publishing...";
    btn.disabled = true;

    const payload = { 
        title, 
        content,
        category,
        is_published: 1,
        slug: title.toLowerCase()
                  .replace(/[^a-z0-9 ]/g, '')
                  .replace(/\s+/g, '-') 
    };

    try {
        const res = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await window.gameAlert("Article published successfully!", "Success");
            window.location.href = '../';
        } else {
            const errorText = await res.text();
            await window.gameAlert("Error: " + errorText, "Publish Error");
            btn.innerText = "Publish Post";
            btn.disabled = false;
        }
    } catch (err) {
        await window.gameAlert("Network error. Please try again.", "Network Error");
        btn.innerText = "Publish Post";
        btn.disabled = false;
    }
});