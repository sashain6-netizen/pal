// global-auth.js
async function checkAuth() {
    try {
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

    if (isLoggedIn && userData.loggedIn) {
        if (loggedInLinks) loggedInLinks.style.display = 'flex';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        
        const userColor = userData.themeColor || "#2563eb";
        profileIcon.innerHTML = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
                <circle cx="50" cy="35" r="18" fill="none" stroke="${userColor}" stroke-width="10" />
                <path d="M25 85 C25 65 75 65 75 85" fill="none" stroke="${userColor}" stroke-width="10" stroke-linecap="round" />
            </svg>`;
        profileIcon.style.borderColor = userColor;
    } else {
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
        profileIcon.innerHTML = `<svg ... guest svg code ...></svg>`; // Use your guest SVG here
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    await fetch('/api/logout');
    window.location.reload();
}

// Initialize on every page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    const logoutBtn = document.getElementById('logoutLink');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});