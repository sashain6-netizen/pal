document.addEventListener('DOMContentLoaded', async () => {
    // 1. ANIMATION LOGIC (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.staff-card, .social-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(card);
    });

    // 2. AUTH & UI INITIALIZATION
    await checkAuth();

    // 3. LOGOUT LISTENER
    const logoutBtn = document.getElementById('logoutLink');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) throw new Error("Not logged in");
        const data = await response.json();

        updateUI(data.loggedIn, data);
    } catch (err) {
        updateUI(false);
    }
}

function updateUI(isLoggedIn, userData = {}) {
    const loggedInLinks = document.getElementById('loggedInLinks');
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const profileIconContainer = document.querySelector('.profile-icon');

    if (isLoggedIn) {
        if (loggedInLinks) loggedInLinks.style.display = 'block';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';

        const userColor = userData.themeColor || "#2563eb";

        // Matching the bold stroke-width=10 from the main page
        if (profileIconContainer) {
            profileIconContainer.innerHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
                    <circle cx="50" cy="35" r="18" fill="none" stroke="${userColor}" stroke-width="10" />
                    <path d="M25 85 C25 65 75 65 75 85" fill="none" stroke="${userColor}" stroke-width="10" stroke-linecap="round" />
                </svg>
            `;
            profileIconContainer.style.borderColor = userColor;
            profileIconContainer.style.background = "#ffffff";
        }
    } else {
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'block';
        
        if (profileIconContainer) {
            profileIconContainer.innerHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
                    <circle cx="50" cy="35" r="18" fill="none" stroke="#cbd5e1" stroke-width="10" />
                    <path d="M25 85 C25 65 75 65 75 85" fill="none" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" />
                </svg>
            `;
            profileIconContainer.style.borderColor = "#cbd5e1";
            profileIconContainer.style.background = "#f1f5f9";
        }
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    try {
        await fetch('/api/logout');
        localStorage.removeItem('pal_user');
        window.location.reload();
    } catch (err) {
        window.location.reload();
    }
}