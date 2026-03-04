// 1. The Toast Engine (Stays the same, it's great)
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
    toast.innerHTML = `<span>${message}</span><span class="toast-close">&times;</span>`;
    container.appendChild(toast);
    toast.offsetHeight; 
    toast.classList.add('show');
    const dismiss = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    };
    setTimeout(dismiss, 4000);
    toast.querySelector('.toast-close').onclick = dismiss;
}

// 2. Load Profile Data
async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) throw new Error("Not logged in");
        const user = await res.json();
        
        document.getElementById('display-username').value = user.username;
        document.getElementById('displayName').value = user.displayName || "";
        document.getElementById('bio').value = user.bio || "";
        document.getElementById('themeColor').value = user.themeColor || "#2563eb";
        
        if (user.avatarUrl) {
            document.getElementById('avatar-img').src = user.avatarUrl;
            document.getElementById('avatar-url').value = user.avatarUrl;
        }
    } catch (err) {
        window.location.href = "/login";
    }
}

// 3. Handle Avatar Upload (Compressed & Single Declaration)
const avatarInput = document.getElementById('avatar-input');
const avatarImg = document.getElementById('avatar-img');

avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show instant preview using local blob (fast UI)
    avatarImg.src = URL.createObjectURL(file);

    try {
        const compressedFile = await compressImage(file, 400, 400);
        const formData = new FormData();
        formData.append('file', compressedFile);

        const res = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById('avatar-url').value = data.url;
            avatarImg.src = data.url; // Update to the real cloud URL
            showToast("Photo uploaded!", "success");
        } else {
            throw new Error();
        }
    } catch (err) {
        showToast("Upload failed", "error");
    }
});

// 4. Handle Form Save
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Saving...";
    btn.disabled = true;

    const updates = {
        displayName: document.getElementById('displayName').value,
        bio: document.getElementById('bio').value,
        themeColor: document.getElementById('themeColor').value,
        avatarUrl: document.getElementById('avatar-url').value // MUST INCLUDE THIS
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

// 5. Compression Helper
async function compressImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > height) {
                    if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                } else {
                    if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.8);
            };
        };
    });
}

loadProfile();