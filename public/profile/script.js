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

        // 1. Form Inputs
        updateEl('display-username', `@${user.username}`); 
        updateEl('displayName', user.displayName || user.username);
        updateEl('bio', user.bio || "");
        
        const themeEl = document.getElementById('themeColor');
        if (themeEl) themeEl.value = user.themeColor || "#2563eb";

        // 2. Stats Display
        updateEl('stat-rank', user.rank || "Member");
        updateEl('stat-currency', (user.currency || 0).toLocaleString());
        updateEl('stat-xp', `${(user.xp || 0).toLocaleString()} XP`);
        
        const followers = user.followersCount ?? (Array.isArray(user.followers) ? user.followers.length : 0);
        updateEl('stat-followers', followers.toLocaleString());

        const following = user.followingCount ?? (Array.isArray(user.following) ? user.following.length : 0);
        updateEl('stat-following', following.toLocaleString());

        // --- XP BAR LADDER LOGIC ---
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const ladder = [
                { name: "Legend", xp: 30000 },
                { name: "Elite", xp: 15000 },
                { name: "Veteran", xp: 7500 },
                { name: "Contributor", xp: 3500 },
                { name: "Supporter", xp: 1500 },
                { name: "Active Member", xp: 500 },
                { name: "Member", xp: 0 }
            ].reverse();

            const currentXP = user.xp || 0;
            const nextRank = ladder.find(r => r.xp > currentXP);
            const currentRank = [...ladder].reverse().find(r => currentXP >= r.xp);

            if (!nextRank) {
                xpBar.style.width = "100%";
            } else {
                const min = currentRank.xp;
                const max = nextRank.xp;
                const progress = ((currentXP - min) / (max - min)) * 100;
                xpBar.style.width = `${Math.max(0, Math.min(progress, 100))}%`;
            }
            // Optional: Color the bar based on their theme
            xpBar.style.backgroundColor = user.themeColor || "#2563eb";
        }

    } catch (err) {
        console.log("Profile load failed.");
    }
}

// --- SAVE CHANGES LOGIC ---
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Feedback: Disable button while saving
    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalText = saveBtn ? saveBtn.textContent : "Save Changes";
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
    }

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
            showToast("Profile updated successfully! ✨");
            // Update the UI theme immediately without a refresh
            document.documentElement.style.setProperty('--blue-primary', updatedData.themeColor);
        } else {
            showToast("⚠️ Failed to update profile.");
        }
    } catch (err) {
        showToast("🛑 Error saving changes.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }
});

document.addEventListener('DOMContentLoaded', loadProfile);