async function loadNotifications() {
    const list = document.getElementById('notif-list');
    const clearBtn = document.getElementById('clear-all-btn');
    
    const res = await fetch('/api/notifications');
    const data = await res.json();

    if (data.length === 0) {
        list.innerHTML = '<p class="empty">No new notifications.</p>';
        clearBtn.style.display = 'none'; // Hide if no notifs
        return;
    }

    clearBtn.style.display = 'block'; // Show if there are notifs
    list.innerHTML = data.map(n => `
        <div class="notif-card" id="notif-${n.id}">
            <div class="notif-content">
                <p><strong>${n.from || 'System'}</strong> ${n.text}</p>
                <span>${new Date(n.date).toLocaleDateString()}</span>
            </div>
            <button class="close-btn" onclick="deleteNotif('${n.id}')">&times;</button>
        </div>
    `).join('');
}

// Function for the Clear All button
document.getElementById('clear-all-btn').onclick = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;

    const res = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ clearAll: true }), // Tell backend to clear all
        headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
        loadNotifications(); // Refresh the list
    }
};

async function deleteNotif(id) {
    const el = document.getElementById(`notif-${id}`);
    if (el) el.style.opacity = '0.5';

    await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ notifId: id }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    loadNotifications();
}

loadNotifications();