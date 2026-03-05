const list = document.getElementById('notif-list');

async function loadNotifications() {
    try {
        const res = await fetch('/api/notifications');
        const data = await res.json();

        if (data.length === 0) {
            list.innerHTML = '<p class="empty">No new notifications.</p>';
            return;
        }

        list.innerHTML = data.map(n => `
            <div class="notif-card" id="notif-${n.id}">
                <div class="notif-content">
                    <p><strong>${n.from || 'System'}</strong> ${n.text}</p>
                    <span>${new Date(n.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button class="close-btn" onclick="deleteNotif('${n.id}')">&times;</button>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<p class="error">Failed to load notifications.</p>';
    }
}

async function deleteNotif(id) {
    const el = document.getElementById(`notif-${id}`);
    if (el) el.style.opacity = '0.5'; // Visual feedback that it's deleting

    const res = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ notifId: id }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
        if (el) el.remove(); // Remove it fully from the page
    } else {
        if (el) el.style.opacity = '1'; // Bring it back if delete failed
        alert("Could not delete notification.");
    }
}

loadNotifications();