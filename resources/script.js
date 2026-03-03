document.addEventListener('DOMContentLoaded', async () => {
    // 1. ANIMATION LOGIC (Intersection Observer)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.staff-card, .social-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(card);
    });

    // 2. AUTH CHECK LOGIC (The "Real" Check)
    await checkAuth();
});

async function checkAuth() {
    try {
        const response = await fetch('/api/me');
        const data = await response.json();

        const loggedInLinks = document.getElementById('loggedInLinks');
        const loggedOutLinks = document.getElementById('loggedOutLinks');
        const profileImg = document.querySelector('.profile-icon img');

        if (data.loggedIn) {
            loggedInLinks.style.display = 'block';
            loggedOutLinks.style.display = 'none';
            // Set profile image based on username
            if (profileImg) {
                profileImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`;
            }
        } else {
            loggedInLinks.style.display = 'none';
            loggedOutLinks.style.display = 'block';
        }
    } catch (err) {
        console.log("Not logged in or API offline");
    }
}

// 3. LOGOUT LOGIC
async function logout() {
    await fetch('/api/logout'); // Tells the server to clear the cookie
    window.location.reload();   // Refreshes the page to reset the UI
}