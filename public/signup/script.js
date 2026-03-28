async function loadProfile() {
    const publicPages = ['/login', '/signup', '/index.html', '/'];
    const isPublicPage = publicPages.some(path => window.location.pathname.endsWith(path));

    try {
        const res = await fetch('/api/get-profile');

                if (!res.ok) {
            if (!isPublicPage) {
                window.location.href = "/";
            }
            return;
        }

        const user = await res.json();

        if (document.getElementById('display-username')) {
            document.getElementById('display-username').value = user.username;
            document.getElementById('displayName').value = user.displayName || "";
            document.getElementById('bio').value = user.bio || "";
            document.getElementById('themeColor').value = user.themeColor || "#2563eb";
        }
    } catch (err) {
        console.error("Auth error:", err);
        if (!isPublicPage) {
            window.location.href = "/";
        }
    }
}

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

document.addEventListener('click', async (e) => {
    const logoutBtn = e.target.closest('#logoutLink');

        if (logoutBtn) {
        e.preventDefault();

                try {
            const res = await fetch('/api/logout');

                        if (res.ok) {
                localStorage.clear();

                if (typeof updateGlobalUI === 'function') {
                    updateGlobalUI(false);
                }

                showToast("Logged out successfully", "success");

            }
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }
});

async function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const btn = form.querySelector('button');
    const originalText = btn.innerText;

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    btn.innerText = "Creating Account...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Account created! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } else {
            showToast(data.error || "Signup failed", "error");
        }
    } catch (err) {
        showToast("Connection error", "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

loadProfile();
