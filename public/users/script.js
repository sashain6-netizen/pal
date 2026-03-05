async function loadProfile() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id')?.toLowerCase();
    
    if (!userId) {
        alert("DEBUG: No User ID found in the URL!");
        return;
    }

    const followBtn = document.getElementById('follow-btn');
    const messageBtn = document.getElementById('message-btn');

    try {
        const [pubRes, meRes] = await Promise.all([
            fetch(`/api/get-user-public?id=${userId}`),
            fetch('/api/get-profile')
        ]);

        const data = await pubRes.json();
        const myData = meRes.ok ? await meRes.json() : null;

        if (!myData) {
            alert("DEBUG: You are NOT logged in. The server doesn't know who you are.");
            if (followBtn) followBtn.style.display = 'none';
            return;
        }

        const myId = myData.username.toLowerCase();
        const myFollowing = Array.isArray(myData.following) ? myData.following : [];

        // --- THE VISUAL TEST ---
        // This will pop up and show us exactly what the computer is comparing
        const isFollowing = myFollowing.some(id => id.toLowerCase() === userId);
        
        // Un-comment the line below if you want a popup every time you refresh:
        // alert(`DEBUG: Target is ${userId}. Your following list: ${JSON.stringify(myFollowing)}. Match found: ${isFollowing}`);

        const updateUI = (state) => {
            if (state) {
                followBtn.textContent = "Unfollow";
                followBtn.style.setProperty('background-color', '#cbd5e1', 'important');
                followBtn.style.setProperty('color', '#64748b', 'important');
            } else {
                followBtn.textContent = "Follow";
                followBtn.style.setProperty('background-color', '#2563eb', 'important');
                followBtn.style.setProperty('color', 'white', 'important');
            }
        };

        updateUI(isFollowing);

        // --- MESSAGE LOGIC ---
        if (messageBtn) {
            messageBtn.onclick = async () => {
                const msg = prompt("Type your message:");
                if (!msg) return;

                const res = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetId: userId,
                        from: myData.displayName || myData.username,
                        text: msg,
                        type: "message"
                    })
                });

                if (res.ok) alert("Message Sent!");
                else alert("Error sending message.");
            };
        }

        // --- FOLLOW LOGIC ---
        followBtn.onclick = async () => {
            followBtn.disabled = true;
            const res = await fetch('/api/follow-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId: userId })
            });

            if (res.ok) {
                const result = await res.json();
                // IMPORTANT: We update the UI based on what the SERVER says happened
                updateUI(result.following);
                document.getElementById('stat-followers').textContent = result.newCount.toLocaleString();
            } else {
                alert("Follow failed on the server.");
            }
            followBtn.disabled = false;
        };

    } catch (err) {
        alert("CRITICAL ERROR: " + err.message);
    }
}
document.addEventListener('DOMContentLoaded', loadProfile);