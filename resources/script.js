document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to cards
    const cards = document.querySelectorAll('.staff-card, .social-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(card);
    });
});

// This is a simple flag to simulate login status
let userIsLoggedIn = false; 

function updateNavbarUI() {
    const loggedInDiv = document.getElementById('loggedInLinks');
    const loggedOutDiv = document.getElementById('loggedOutLinks');

    if (userIsLoggedIn) {
        loggedInDiv.style.display = 'block';
        loggedOutDiv.style.display = 'none';
    } else {
        loggedInDiv.style.display = 'none';
        loggedOutDiv.style.display = 'block';
    }
}

// Function to call when user logs in or out
function toggleLogin(status) {
    userIsLoggedIn = status;
    updateNavbarUI();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarUI();
});