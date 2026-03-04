function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container') || document.querySelector('.toast-container');
    
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
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 2. HIDE AND REMOVE
    setTimeout(() => {
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 500); 
    }, 3000);

    // 3. MANUAL CLOSE
    toast.querySelector('.toast-close').onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    };
}

// 2. Fetch current profile data
async function loadProfile() {
    // List of pages where we DON'T want to force a redirect
    const publicPages = ['/login', '/signup', '/index.html', '/']; 
    const isPublicPage = publicPages.some(path => window.location.pathname.endsWith(path));

    try {
        const res = await fetch('/api/get-profile');
        
        if (!res.ok) {
            // If the user isn't logged in, only redirect if they are on a "protected" page
            if (!isPublicPage) {
                window.location.href = "/login";
            }
            return; // Exit the function safely
        }

        const user = await res.json();
        
        // Use optional chaining (?.) so it doesn't crash if these inputs don't exist on the page
        if (document.getElementById('display-username')) {
            document.getElementById('display-username').value = user.username;
            document.getElementById('displayName').value = user.displayName || "";
            document.getElementById('bio').value = user.bio || "";
            document.getElementById('themeColor').value = user.themeColor || "#2563eb";
        }
    } catch (err) {
        console.error("Auth error:", err);
        // Only redirect if it's a critical error on a private page
        if (!isPublicPage) {
            window.location.href = "/login"; 
        }
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

async function handleSignup(event) {
    event.preventDefault(); // Stops the page from refreshing

    const form = event.target;
    const btn = form.querySelector('button');
    const originalText = btn.innerText;

    // 1. Get values using the IDs from your HTML
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 2. Simple UI state
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
            // This displays "Username taken" or "Email in use" from your Worker
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