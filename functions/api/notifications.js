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

export async function onRequestGet(context) {
    const { request, env } = context;
    const cookie = request.headers.get("Cookie") || "";
    const tokenPart = cookie.split("pal_session=")[1];
    
    if (!tokenPart) return new Response(JSON.stringify({ error: "No cookie" }), { status: 401 });
    
    const token = tokenPart.split(";")[0];
    const payload = JSON.parse(atob(token.split(".")[1]));
    
    // Check if the username is coming through correctly
    console.log("Fetching for user:", payload.username); 

    const userKey = `user:${payload.username.toLowerCase()}`;
    const rawData = await env.USERS_KV.get(userKey);
    
    if (!rawData) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    const user = JSON.parse(rawData);
    return new Response(JSON.stringify(user.notifications || []), {
        headers: { "Content-Type": "application/json" }
    });
}

loadNotifications();