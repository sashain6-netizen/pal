// --- LOAD NOTIFICATIONS ---

// Format timestamp for consistent display across the platform
function formatTimestamp(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    
    // Compare using local timezone by getting the date parts in local time
    const postDateLocal = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = postDateLocal.getTime() === nowLocal.getTime();

    if (isToday) {
        return postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return postDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
}

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
        list.innerHTML = data.map(n => {
        const profileLink = n.fromId ? `/users?id=${n.fromId.toLowerCase()}` : null;
        
        const senderHTML = profileLink
            ? `<a href="${profileLink}" class="notif-user-link">${n.from || 'System'}</a>`
            : `<strong class="notif-system-name">${n.from || 'System'}</strong>`;

        return `
            <div class="notif-card" id="notif-${n.id}">
                <div class="notif-fcontent">
                    <p>
                        ${senderHTML} 
                        <span class="notif-text">${n.text}</span>
                    </p>
                    <span class="notif-date">${formatTimestamp(n.date)}</span>
                </div>
                <button class="close-btn" onclick="deleteNotif('${n.id}')">&times;</button>
            </div>
        `;
    }).join('');
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