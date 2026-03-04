// 1. Toast Engine - Now searches for the container correctly
function showToast(message, type = 'success') {
    // Looks for #toast-container OR .toast-container
    let container = document.getElementById('toast-container') || document.querySelector('.toast-container');
    
    // Fallback: If no container exists at all, create it
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container'; // Sets ID to match your JS search
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // Keeps .toast as a class for CSS
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 2. Fetch current profile data
async function loadProfile() {
    try {
        const res = await fetch('/api/get-profile');
        if (!res.ok) throw new Error("Not logged in");

        const user = await res.json();
        
        document.getElementById('display-username').value = user.username;
        document.getElementById('displayName').value = user.displayName || "";
        document.getElementById('bio').value = user.bio || "";
        document.getElementById('themeColor').value = user.themeColor || "#2563eb";
    } catch (err) {
        console.error("Auth error:", err);
        window.location.href = "/login"; 
    }
}

// 3. Handle the Save
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
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
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// 4. FIX: Logout logic
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault(); // This STOPS the "#" behavior
    console.log("Logging out...");
    // Clear cookie
    document.cookie = "pal_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect
    window.location.href = "/login";
});

loadProfile();