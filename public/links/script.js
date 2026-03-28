// Links Page JavaScript
let links = [];

// Load links from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
    renderLinks();
    setupEventListeners();
});

function loadLinks() {
    const storedLinks = localStorage.getItem('pal-links');
    if (storedLinks) {
        links = JSON.parse(storedLinks);
    } else {
        // Add some default links for demonstration
        links = [
            {
                id: Date.now() + 1,
                title: 'Our GitHub',
                url: 'https://github.com/sashain6-netizen/pal',
                description: 'Our open source project repository',
                image: 'https://github.com/favicon.ico?raw=true'
            },
            {
                id: Date.now() + 2,
                title: 'Ghastly Games',
                url: 'https://ghastly-games-2point0.pages.dev',
                description: 'The thing that sparked it all',
                image: 'https://github.com/sashain6-netizen/Ghastly-Games/blob/master/favicon.png?raw=true'
            },
            {
                id: Date.now() + 3,
                title: 'Chatify',
                url: 'https://plane65k.github.io/chatify-public/',
                description: 'A simple chat app for everyone',
                image: 'https://github.com/plane65k/realworkingchatapp/blob/main/SDG_log.png?raw=true'
            }
        ];
        saveLinks();
    }
}

function saveLinks() {
    localStorage.setItem('pal-links', JSON.stringify(links));
}

function renderLinks() {
    const linksGrid = document.getElementById('linksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (links.length === 0) {
        linksGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        linksGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        linksGrid.innerHTML = links.map(link => createLinkCard(link)).join('');
    }
}

function createLinkCard(link) {
    const imageContent = link.image 
        ? `<img src="${link.image}" alt="${link.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
               <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
               <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
           </svg>`
        : `<svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
               <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
           </svg>`;
    
    return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-card" onclick="handleLinkClick(event, '${link.id}')">
            <div class="link-card-header">
                <div class="link-image">
                    ${imageContent}
                </div>
                <div class="link-info">
                    <div class="link-title">${escapeHtml(link.title)}</div>
                    <div class="link-url">${escapeHtml(link.url)}</div>
                </div>
            </div>
            ${link.description ? `<div class="link-description">${escapeHtml(link.description)}</div>` : ''}
            <div class="link-actions">
                <button class="action-btn" onclick="event.stopPropagation(); openEditLinkModal('${link.id}')" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); copyLink('${link.url}')" title="Copy URL">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        </a>
    `;
}

function handleLinkClick(event, linkId) {
    // Allow the link to open in a new tab normally
    event.stopPropagation();
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

function openAddLinkModal() {
    document.getElementById('addLinkModal').style.display = 'block';
    document.getElementById('addLinkForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
}

function closeAddLinkModal() {
    document.getElementById('addLinkModal').style.display = 'none';
}

function openEditLinkModal(linkId) {
    const link = links.find(l => l.id == linkId);
    if (!link) return;
    
    document.getElementById('editLinkId').value = link.id;
    document.getElementById('editLinkTitle').value = link.title;
    document.getElementById('editLinkUrl').value = link.url;
    document.getElementById('editLinkDescription').value = link.description || '';
    document.getElementById('editLinkImage').value = link.image || '';
    
    const preview = document.getElementById('editImagePreview');
    if (link.image) {
        preview.innerHTML = `<img src="${link.image}" alt="Preview" onerror="this.style.display='none'">`;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    
    document.getElementById('editLinkModal').style.display = 'block';
}

function closeEditLinkModal() {
    document.getElementById('editLinkModal').style.display = 'none';
}

function deleteLink() {
    const linkId = document.getElementById('editLinkId').value;
    
    if (confirm('Are you sure you want to delete this link?')) {
        links = links.filter(l => l.id != linkId);
        saveLinks();
        renderLinks();
        closeEditLinkModal();
        showToast('Link deleted successfully', 'success');
    }
}

function setupEventListeners() {
    // Add link form
    document.getElementById('addLinkForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newLink = {
            id: Date.now(),
            title: document.getElementById('linkTitle').value.trim(),
            url: document.getElementById('linkUrl').value.trim(),
            description: document.getElementById('linkDescription').value.trim(),
            image: document.getElementById('linkImage').value.trim()
        };
        
        // Validate URL
        try {
            new URL(newLink.url);
        } catch {
            showToast('Please enter a valid URL', 'error');
            return;
        }
        
        links.unshift(newLink);
        saveLinks();
        renderLinks();
        closeAddLinkModal();
        showToast('Link added successfully', 'success');
    });
    
    // Edit link form
    document.getElementById('editLinkForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const linkId = document.getElementById('editLinkId').value;
        const linkIndex = links.findIndex(l => l.id == linkId);
        
        if (linkIndex === -1) return;
        
        // Validate URL
        const url = document.getElementById('editLinkUrl').value.trim();
        try {
            new URL(url);
        } catch {
            showToast('Please enter a valid URL', 'error');
            return;
        }
        
        links[linkIndex] = {
            id: parseInt(linkId),
            title: document.getElementById('editLinkTitle').value.trim(),
            url: url,
            description: document.getElementById('editLinkDescription').value.trim(),
            image: document.getElementById('editLinkImage').value.trim()
        };
        
        saveLinks();
        renderLinks();
        closeEditLinkModal();
        showToast('Link updated successfully', 'success');
    });
    
    // Image preview for add form
    document.getElementById('linkImage').addEventListener('input', (e) => {
        const preview = document.getElementById('imagePreview');
        const url = e.target.value.trim();
        
        if (url) {
            preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.style.display='none'; this.parentElement.style.display='none'">`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
    
    // Image preview for edit form
    document.getElementById('editLinkImage').addEventListener('input', (e) => {
        const preview = document.getElementById('editImagePreview');
        const url = e.target.value.trim();
        
        if (url) {
            preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.style.display='none'; this.parentElement.style.display='none'">`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddLinkModal();
            closeEditLinkModal();
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toast notification function (fallback if global toast isn't available)
function showToast(message, type = 'info') {
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Simple fallback toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Varela Round', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
