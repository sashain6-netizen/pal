async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) {
            if (res.status === 401) window.location.href = "/login";
            return;
        }

        const user = await res.json();

        // Helper to update based on your specific HTML IDs
        const updateEl = (id, val, isInput = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (isInput || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = val ?? '';
            } else {
                el.textContent = val ?? '';
            }
        };

        // 1. Form Inputs (The ones you can edit)
        updateEl('display-username', `@${user.username}`); // The disabled one
        updateEl('displayName', user.displayName || user.username);
        updateEl('bio', user.bio || "");
        
        const themeEl = document.getElementById('themeColor');
        if (themeEl) themeEl.value = user.themeColor || "#2563eb";

        // 2. Stats Display (The ones at the bottom)
        updateEl('stat-rank', user.rank || "Member");
        updateEl('stat-currency', (user.currency || 0).toLocaleString());
        updateEl('stat-xp', `${(user.xp || 0).toLocaleString()} XP`);
        
        // Followers/Following
        const followers = user.followersCount ?? (Array.isArray(user.followers) ? user.followers.length : 0);
        updateEl('stat-followers', followers.toLocaleString());

        const following = user.followingCount ?? (Array.isArray(user.following) ? user.following.length : 0);
        updateEl('stat-following', following.toLocaleString());

        // 3. XP Bar
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar && user.xp) {
            const progress = Math.min((user.xp % 10000) / 100, 100);
            xpBar.style.width = `${progress}%`;
        }

    } catch (err) {
        console.log("Profile load failed.");
    }
}

// Save Changes Logic
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updatedData = {
        displayName: document.getElementById('displayName').value,
        bio: document.getElementById('bio').value,
        themeColor: document.getElementById('themeColor').value
    };

    try {
        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            alert("Profile updated successfully!");
        } else {
            alert("Failed to update profile.");
        }
    } catch (err) {
        alert("Error saving changes.");
    }
});

document.addEventListener('DOMContentLoaded', loadProfile);