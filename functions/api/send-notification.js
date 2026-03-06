// 1. Ensure the toast system exists on this page
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// 2. Make deleteNotif global so the 'onclick' attribute can see it
window.deleteNotif = async function(id) {
    // Visual feedback: dim the card immediately
    const el = document.getElementById(`notif-${id}`);
    if (el) el.style.opacity = '0.3';

    try {
        const res = await fetch('/api/notifications', {
            method: 'POST',
            body: JSON.stringify({ notifId: id }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (res.ok) {
            showToast("Notification removed.");
            loadNotifications(); // Refresh the list
        }
    } catch (err) {
        if (el) el.style.opacity = '1';
        showToast("Failed to delete.");
    }
};

async function loadNotifications() {
    const list = document.getElementById('notif-list');
    const clearBtn = document.getElementById('clear-all-btn');
    if (!list) return;

    try {
        const res = await fetch('/api/notifications');
        const data = await res.json();

        if (!data || data.length === 0) {
            list.innerHTML = '<p class="empty">No new notifications.</p>';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        if (clearBtn) clearBtn.style.display = 'block';

        list.innerHTML = data.map(n => `
            <div class="notif-card" id="notif-${n.id}">
                <div class="notif-content">
                    <p><strong>${n.from || 'System'}</strong> ${n.text}</p>
                    <span>${new Date(n.date).toLocaleString()}</span>
                </div>
                <button class="close-btn" onclick="deleteNotif('${n.id}')">&times;</button>
            </div>
        `).join('');
    } catch (e) {
        showToast("Error loading notifications.");
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadNotifications);