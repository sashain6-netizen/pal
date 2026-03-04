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
        if (!res.ok) throw new Error("Not logged in");

        const user = await res.json();
        
        document.getElementById('display-username').value = user.username;
        document.getElementById('displayName').value = user.displayName || "";
        document.getElementById('bio').value = user.bio || "";
        document.getElementById('themeColor').value = user.themeColor || "#2563eb";
        
        // Update the image preview if a URL exists
        if (user.avatarUrl) {
            document.getElementById('avatar-img').src = user.avatarUrl;
            document.getElementById('avatar-url').value = user.avatarUrl;
        }
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

const avatarInput = document.getElementById('avatar-input');
const avatarImg = document.getElementById('avatar-img');

avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show instant preview
    avatarImg.src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData 
            // Note: Cloudflare Functions handle FormData automatically
        });

        const data = await res.json();
        if (res.ok) {
            // Store the returned URL in a hidden input to save with the profile later
            document.getElementById('avatar-url').value = data.url;
            showToast("Image uploaded!", "success");
        }
    } catch (err) {
        showToast("Upload failed", "error");
    }
});

loadProfile();