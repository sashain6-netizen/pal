// 1. The Toast Engine
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close">&times;</span>
    `;

    container.appendChild(toast);
    toast.offsetHeight; // Force reflow for animation
    toast.classList.add('show');

    const dismiss = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    };

    setTimeout(dismiss, 4000);
    toast.querySelector('.toast-close').onclick = dismiss;
}

// 1. Fetch current profile data when the page opens

async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) throw new Error("Unauthorized");
        const user = await res.json();

        // 1. Fill Form
        document.getElementById('display-username').value = user.username;
        document.getElementById('displayName').value = user.displayName;
        document.getElementById('bio').value = user.bio;
        document.getElementById('themeColor').value = user.themeColor;

        // 2. Update Stats
        document.getElementById('stat-rank').innerText = user.rank;
        document.getElementById('stat-xp-rank').innerText = user.rank !== user.xpRank ? `(${user.xpRank})` : "";
        document.getElementById('stat-currency').innerText = user.currency.toLocaleString();
        document.getElementById('stat-followers').innerText = user.followersCount;
        document.getElementById('stat-following').innerText = user.followingCount;
        document.getElementById('stat-xp').innerText = `${user.xp.toLocaleString()} XP`;

        const ladder = [30000, 15000, 7500, 3500, 1500, 500, 0];

        const nextRankXp = ladder.find(xp => xp > user.xp) || 30000;
        const currentRankXp = [...ladder].reverse().find(xp => xp <= user.xp) || 0;

        const range = nextRankXp - currentRankXp;
        const progressSinceLastRank = user.xp - currentRankXp;

        let percent = range > 0 ? (progressSinceLastRank / range) * 100 : 0;

        document.getElementById('xp-bar-fill').style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
    } catch (err) {
        window.location.href = "/login";
    }
}

// 2. Handle the Save
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Saving...";
    btn.disabled = true;

    const updates = {
        displayName: document.getElementById('displayName').value,
        bio: document.getElementById('bio').value,
        themeColor: document.getElementById('themeColor').value
    };

    try {
        const res = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (res.ok) {
            showToast("Profile updated successfully!", "success");
        } else {
            showToast("Failed to update profile", "error");
        }
    } catch (err) {
        showToast("Connection error", "error");
    } finally {
        btn.innerText = "Save Changes";
        btn.disabled = false;
    }
});

loadProfile();