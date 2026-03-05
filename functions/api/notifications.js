const list = document.getElementById('notif-list');

async function loadNotifications() {
    const res = await fetch('/api/notifications');
    const data = await res.json();

    if (data.length === 0) {
        list.innerHTML = '<p class="empty">No new notifications.</p>';
        return;
    }

    list.innerHTML = data.map(n => `
        <div class="notif-card" id="notif-${n.id}">
            <div class="notif-content">
                <p>${n.text}</p>
                <span>${new Date(n.date).toLocaleDateString()}</span>
            </div>
            <button class="close-btn" onclick="deleteNotif(${n.id})">&times;</button>
        </div>
    `).join('');
}

async function deleteNotif(id) {
    // Remove from UI immediately for speed
    document.getElementById(`notif-${id}`).style.display = 'none';

    // Update the Database
    await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ notifId: id }),
        headers: { 'Content-Type': 'application/json' }
    });
}

loadNotifications();