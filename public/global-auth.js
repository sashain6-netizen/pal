async function checkAuth() {
    try {
        // NOTE: Ensure your Cloudflare function is at /api/me 
        // or change this to /api/get-profile to match your other code
        const response = await fetch('/api/me'); 
        if (!response.ok) throw new Error();
        const data = await response.json();
        updateGlobalUI(data.loggedIn, data);
    } catch (e) {
        updateGlobalUI(false);
    }
}

function updateGlobalUI(isLoggedIn, userData = {}) {
    const loggedInLinks = document.getElementById('loggedInLinks');
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const profileIcon = document.querySelector('.profile-icon');
    const navAvatar = document.getElementById('nav-avatar');

    if (isLoggedIn) {
        // 1. Toggle Menu Visibility
        if (loggedInLinks) loggedInLinks.style.display = 'flex';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        
        // 2. Update Border Color
        const userColor = userData.themeColor || "#2563eb";
        if (profileIcon) {
            profileIcon.style.borderColor = userColor;
        }

        // 3. Update Avatar Image (Don't overwrite the whole HTML)
        if (navAvatar) {
            // Only update the src if the user actually has a custom avatar URL
            if (userData.avatarUrl) {
                navAvatar.src = userData.avatarUrl;
            }
            navAvatar.style.display = 'block'; // Ensure it's visible
        }
    } else {
        // 4. Logged Out State
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
        
        if (navAvatar) {
            navAvatar.src = "/default-avatar.png"; // Revert to default
        }
        if (profileIcon) {
            profileIcon.style.borderColor = "var(--blue-primary)";
        }
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    // Ensure this matches your actual logout route
    await fetch('/api/logout'); 
    // Clear the cookie manually just in case
    document.cookie = "pal_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    // Added a small delay check because navbar.js injects the HTML dynamically
    setTimeout(() => {
        const logoutBtn = document.getElementById('logoutLink');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    }, 100); 
});