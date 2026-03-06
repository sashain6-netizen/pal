// Single Source of Truth for Auth
async function checkAuth() {
    try {
        const response = await fetch('/api/me'); 
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        updateGlobalUI(data.loggedIn, data);
        
        // Notify other scripts (like search or shop) that user data is ready
        window.dispatchEvent(new CustomEvent('authReady', { detail: data }));
    } catch (e) {
        updateGlobalUI(false);
    }
}

function updateGlobalUI(isLoggedIn, userData = {}) {
    const loggedInLinks = document.getElementById('loggedInLinks');
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const avatarContainer = document.getElementById('avatar-container');
    const profileIcon = document.getElementById('profile-icon');
    
    if (!profileIcon || !avatarContainer) return;

    if (isLoggedIn) {
        if (loggedInLinks) loggedInLinks.style.display = 'flex';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        
        const userColor = userData.themeColor || "#2563eb";
        profileIcon.style.borderColor = userColor;

        if (userData.avatarUrl && userData.avatarUrl !== "" && userData.avatarUrl !== "/default-avatar.png") {
            avatarContainer.innerHTML = `<img src="${userData.avatarUrl}" id="nav-avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatarContainer.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%; height:70%;">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
                          fill="${userColor}" />
                </svg>`;
        }
        
        // Setup Logout Button immediately if it exists
        const logoutBtn = document.getElementById('logoutLink');
        if (logoutBtn) logoutBtn.onclick = handleLogout;

    } else {
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
        profileIcon.style.borderColor = "#2563eb";
        avatarContainer.innerHTML = `<img src="/default-avatar.png" id="nav-avatar" style="width:100%; height:100%; border-radius:50%;">`;
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    await fetch('/api/logout'); 
    document.cookie = "pal_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
}

// Robust Init: Check auth immediately, and also watch for navbar injection
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Watch for the navbar being added to the DOM to attach the logout listener
    const observer = new MutationObserver(() => {
        const logoutBtn = document.getElementById('logoutLink');
        if (logoutBtn) {
            logoutBtn.onclick = handleLogout;
            observer.disconnect(); // Stop watching once found
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});