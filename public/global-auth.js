async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) throw new Error();
        const data = await response.json();

                updateGlobalUI(data.loggedIn, data);

        window.dispatchEvent(new CustomEvent('authReady', { detail: data }));
    } catch (e) {
        updateGlobalUI(false);
    }
}

function updateGlobalUI(isLoggedIn, userData = {}) {
    window.currentUserData = { loggedIn: isLoggedIn, ...userData };

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

        if (userData.avatar && userData.avatar !== "" && userData.avatar !== "/default-avatar.png") {
            avatarContainer.innerHTML = `<img src="${userData.avatar}" id="nav-avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatarContainer.innerHTML = getCircleFillingAvatarSvg(userColor, '100%');
        }

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

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

        const observer = new MutationObserver(() => {
        const logoutBtn = document.getElementById('logoutLink');
        if (logoutBtn) {
            logoutBtn.onclick = handleLogout;
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

function checkPremium() {
    if (window.currentUserData && window.currentUserData.isPremium === true) {
        return true;
    }
    return false;
}
