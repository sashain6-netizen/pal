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
    
    // We target the container to swap between <img> and <svg>
    if (!profileIcon) return;

    if (isLoggedIn) {
        if (loggedInLinks) loggedInLinks.style.display = 'flex';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        
        const userColor = userData.themeColor || "#2563eb";
        profileIcon.style.borderColor = userColor;

        // Check if user has a custom uploaded photo
        if (userData.avatarUrl && userData.avatarUrl !== "" && userData.avatarUrl !== "/default-avatar.png") {
            // SHOW THE PHOTO
            profileIcon.innerHTML = `<img src="${userData.avatarUrl}" id="nav-avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            // SHOW THE COLORED SILHOUETTE
            // We use the 'fill' attribute to apply the user's color to the person shape
            profileIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%; height:70%;">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                          fill="${userColor}" />
                </svg>`;
        }
    } else {
        // Logged Out State
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
        profileIcon.style.borderColor = "var(--blue-primary)";
        profileIcon.innerHTML = `<img src="/default-avatar.png" id="nav-avatar">`;
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