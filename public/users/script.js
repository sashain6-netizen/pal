async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    try {
        // Step 1: Fetch Public User Data
        const response = await fetch(`/api/get-user-public?id=${userId}`);
        if (!response.ok) return;
        const data = await response.json();

        // [Standard Display Logic - Name, Bio, Stats, XP Bar]
        document.getElementById('display-name').textContent = data.displayName || data.username;
        document.getElementById('display-bio').textContent = data.bio || "No bio yet.";
        document.getElementById('display-username').textContent = `@${data.username}`;
        document.getElementById('stat-rank').textContent = data.rank || "Member";
        document.getElementById('stat-currency').textContent = (data.currency || 0).toLocaleString();
        document.getElementById('stat-xp').textContent = `${(data.xp || 0).toLocaleString()} XP`;
        
        const followersCount = data.followersCount ?? (data.followers || 0);
        document.getElementById('stat-followers').textContent = followersCount.toLocaleString();

        // XP Bar
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar && data.xp) {
            const percentage = Math.min((data.xp % 10000) / 100, 100); 
            xpBar.style.width = `${percentage}%`;
        }

        // Step 2: Fetch "My" Data for Follow/Message Logic
        const meRes = await fetch('/api/get-profile');
        if (!meRes.ok) return; // Exit if not logged in
        const myData = await meRes.json();
        const myId = myData.username.toLowerCase();

        const followBtn = document.getElementById('follow-btn');
        const messageBtn = document.getElementById('message-btn');

        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
            if (messageBtn) messageBtn.style.display = "none";
        } else {
            // --- PERSISTENT FOLLOW CHECK ---
            // If my 'following' array contains this user, grey out the button immediately
            if (myData.following && myData.following.includes(userId)) {
                followBtn.textContent = "Following";
                followBtn.disabled = true;
                followBtn.style.backgroundColor = "#cbd5e1";
                followBtn.style.color = "#64748b";
            }

            // MESSAGE LOGIC
            if (messageBtn) {
                messageBtn.onclick = async () => {
                    const msg = prompt(`Send a message to ${data.displayName}:`);
                    if (!msg) return;
                    const res = await fetch('/api/send-notification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ targetId: userId, from: myData.displayName, text: msg, type: "message" })
                    });
                    if (res.ok) alert("Message sent!");
                };
            }

            // FOLLOW LOGIC
            if (followBtn && !followBtn.disabled) {
                followBtn.onclick = async () => {
                    followBtn.disabled = true;
                    const res = await fetch('/api/follow-user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ targetId: userId })
                    });
                    if (res.ok) {
                        followBtn.textContent = "Following";
                        followBtn.style.backgroundColor = "#cbd5e1";
                        // Update the follower count on screen immediately
                        const current = parseInt(document.getElementById('stat-followers').textContent.replace(/,/g, ''));
                        document.getElementById('stat-followers').textContent = (current + 1).toLocaleString();
                    } else {
                        followBtn.disabled = false;
                    }
                };
            }
        }
    } catch (err) {
        console.log("Profile load failed silently.");
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);