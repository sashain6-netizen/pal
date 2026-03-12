const params = new URLSearchParams(window.location.search);
const id = params.get('id');
let currentRawContent = ""; // Stores unparsed markup for editing

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

// 1. Listen for Auth to show Edit Button
window.addEventListener('authReady', (e) => {
    const userData = e.detail;
    const staffRanks = ['Owner', 'Admin', 'Moderator'];
    
    if (userData.loggedIn && staffRanks.includes(userData.rank)) {
        renderEditButton();
    }
});

function renderEditButton() {
    if (document.getElementById('edit-article-btn')) return;
    const meta = document.getElementById('meta');
    const btn = document.createElement('button');
    btn.id = 'edit-article-btn';
    btn.innerText = "Edit Article";
    btn.onclick = openEditModal;
    meta.appendChild(btn);
}

// 2. Modal Logic
function openEditModal() {
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Article Content</h2>
                <button onclick="closeModal()">×</button>
            </div>
            <div class="editor-grid">
                <textarea id="edit-textarea" placeholder="Enter markup...">${currentRawContent}</textarea>
                <div id="edit-preview" class="preview-box">${parseMarkup(currentRawContent)}</div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" id="save-btn" onclick="saveChanges()">Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Live Preview Listener
    const textarea = document.getElementById('edit-textarea');
    const preview = document.getElementById('edit-preview');
    textarea.addEventListener('input', () => {
        preview.innerHTML = parseMarkup(textarea.value);
    });
}

function closeModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.remove();
}

async function saveChanges() {
    const newContent = document.getElementById('edit-textarea').value;
    const saveBtn = document.getElementById('save-btn');
    
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    try {
        const res = await fetch(`/api/news?id=${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newContent })
        });

        if (res.ok) {
            location.reload();
        } else {
            alert("Failed to save. Check permissions.");
            saveBtn.innerText = "Save Changes";
            saveBtn.disabled = false;
        }
    } catch (err) {
        alert("Error connecting to server.");
        saveBtn.disabled = false;
    }
}

// 3. Initial Load
async function loadArticle() {
    try {
        const res = await fetch(`/api/news?id=${id}`);
        if (!res.ok) {
            document.getElementById('article-content').innerHTML = "<h1>Article not found.</h1>";
            return;
        }

        const data = await res.json();
        currentRawContent = data.content; // Store for the editor

        document.getElementById('title').textContent = data.title;
        const date = new Date(data.created_at).toLocaleDateString();
        document.getElementById('meta').innerHTML = `By <strong>${data.author_name}</strong> (${data.author_rank}) on ${date}`;
        document.getElementById('article-body').innerHTML = parseMarkup(data.content);
        document.title = `${data.title} • Pal`;

    } catch (err) {
        console.error("Error loading article:", err);
    }
}

if (id) { loadArticle(); } else { window.location.href = '../'; }