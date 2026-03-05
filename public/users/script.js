async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    if (!userId) return;

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');

    try {
        // 1. Fetch both at once
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        if (!pubRes.ok) return;
        const data = await pubRes.json();
        const myData = meRes.ok ? await meRes.json() : null;

        // 2. Update Stats
        document.getElementById('stat-followers').textContent = (data.followers || 0).toLocaleString();
        document.getElementById('stat-following').textContent = (Array.isArray(data.following) ? data.following.length : 0).toLocaleString();

        if (!myData) {
            if (followBtn) followBtn.style.display = 'none';
            return;
        }

        const myId = myData.username.toLowerCase();

        // 3. Setup Follow Button State
        if (myId === userId) {
            if (followBtn) followBtn.style.display = "none";
        } else {
            const myFollowing = Array.isArray(myData.following) ? myData.following : [];
            // IMPORTANT: Case-insensitive check
            let currentlyFollowing = myFollowing.some(id => id.toLowerCase() === userId);

            const updateUI = (isFollowing) => {
                if (isFollowing) {
                    followBtn.textContent = "Unfollow";
                    followBtn.style.setProperty('background-color', '#cbd5e1', 'important');
                    followBtn.style.setProperty('color', '#64748b', 'important');
                } else {
                    followBtn.textContent = "Follow";
                    followBtn.style.setProperty('background-color', '#2563eb', 'important');
                    followBtn.style.setProperty('color', 'white', 'important');
                }
            };

            // Set the initial look correctly on refresh
            updateUI(currentlyFollowing);

            // 4. Single-Click Toggle
            followBtn.onclick = async () => {
                followBtn.disabled = true;
                const res = await fetch('/api/follow-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: userId })
                });

                if (res.ok) {
                    const result = await res.json();
                    // Sync the state with what the SERVER says
                    currentlyFollowing = result.following;
                    updateUI(currentlyFollowing);
                    document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
                }
                followBtn.disabled = false;
            };
        }

        // 5. Message Logic
        if (messageBtn && myId !== userId) {
            messageBtn.onclick = async () => {
                const msg = prompt("Send a message:");
                if (!msg) return;
                await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: userId,
                        from: myData.displayName || myData.username,
                        text: msg,
                        type: "message"
                    })
                });
                alert("Sent!");
            };
        }

    } catch (err) {
        console.error("Load error:", err);
    }
}
document.addEventListener('DOMContentLoaded', loadProfile);