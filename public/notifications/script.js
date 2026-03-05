// --- TOAST SYSTEM ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// --- LOAD NOTIFICATIONS ---
async function loadNotifications() {
    const list = document.getElementById('notif-list');
    const clearBtn = document.getElementById('clear-all-btn');
    
    try {
        const res = await fetch('/api/notifications');
        const data = await res.json();

        if (data.length === 0) {
            list.innerHTML = '<p class="empty">No new notifications.</p>';
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';
        list.innerHTML = data.map(n => `
            <div class="notif-card" id="notif-${n.id}">
                <div class="notif-content">
                    <p><strong>${n.from || 'System'}</strong> ${n.text}</p>
                    <span>${new Date(n.date).toLocaleDateString()}</span>
                </div>
                <button class="close-btn" onclick="deleteNotif('${n.id}')">&times;</button>
            </div>
        `).join('');
    } catch (e) {
        showToast("Error loading notifications.");
    }
}

// --- CLEAR ALL (CUSTOM MODAL) ---
const modal = document.getElementById('custom-modal');
const clearBtn = document.getElementById('clear-all-btn');

clearBtn.onclick = () => {
    modal.style.display = 'flex'; // Show custom modal instead of confirm()
};

document.getElementById('modal-cancel').onclick = () => {
    modal.style.display = 'none';
};

document.getElementById('modal-confirm').onclick = async () => {
    modal.style.display = 'none';
    
    const res = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ clearAll: true }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
        showToast("Inbox cleared successfully!");
        loadNotifications();
    } else {
        showToast("Failed to clear notifications.");
    }
};

// --- DELETE INDIVIDUAL ---
async function deleteNotif(id) {
    const el = document.getElementById(`notif-${id}`);
    if (el) el.style.opacity = '0.3';

    const res = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ notifId: id }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) {
        showToast("Notification removed.");
        loadNotifications();
    }
}

loadNotifications();