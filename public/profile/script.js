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
        // We'll create this API next
        const res = await fetch('/api/get-profile');
        if (!res.ok) throw new Error("Not logged in");

        const user = await res.json();
        
        // Fill the form
        document.getElementById('display-username').value = user.username;
        document.getElementById('displayName').value = user.displayName || "";
        document.getElementById('bio').value = user.bio || "";
        document.getElementById('themeColor').value = user.themeColor || "#2563eb";
    } catch (err) {
        window.location.href = "/login"; // Redirect if not authenticated
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