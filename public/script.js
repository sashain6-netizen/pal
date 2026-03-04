(function () {
  'use strict';

 /* ── Element refs ── */
  const palText = document.getElementById('palText');
  const smilePath = document.getElementById('smilePath');
  const tagline = document.getElementById('tagline');
  const logoContainer = document.getElementById('logoContainer');
  const shineEl = document.getElementById('shineEl'); // ADD THIS LINE

  // Check if we are on the home page with the hero
  const hasHeroAnimation = palText && smilePath && logoContainer;

  if (hasHeroAnimation) {
  // Use 'mousedown' or check the target to ensure we don't block links
  logoContainer.addEventListener('click', (e) => {
    // Only play if the user clicked the logo directly, not a child link
    if (e.target.closest('a')) return; 
    
    playFullSequence();
  });

  logoContainer.style.cursor = 'pointer';
  logoContainer.style.transition = 'transform 0.3s ease';
  logoContainer.addEventListener('mouseenter', () => logoContainer.style.transform = 'translateY(-5px)');
  logoContainer.addEventListener('mouseleave', () => logoContainer.style.transform = 'translateY(0)');
}

  /* ── Master sequence ── */
  window.playFullSequence = function() {
    if (!hasHeroAnimation) return;

    tagline.classList.remove('visible');
    
    // Safety check: SVG must be rendered to get length
    let length = 0;
    try {
      length = smilePath.getTotalLength();
    } catch (e) {
      length = 500; // Fallback if SVG isn't ready
    }

    smilePath.style.transition = 'none';
    smilePath.style.strokeDasharray = length;
    smilePath.style.strokeDashoffset = length;

    palText.classList.remove('squeezing');
    void palText.offsetWidth; 
    palText.classList.add('squeezing');

    shineEl.classList.remove('shining');
    void shineEl.offsetWidth;
    shineEl.classList.add('shining');

    setTimeout(() => {
      smilePath.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      smilePath.style.strokeDashoffset = '0';
      
      setTimeout(() => {
        tagline.classList.add('visible');
      }, 500);
    }, 400); 
  };

  /* ── Listeners ── */
  if (hasHeroAnimation) {
    logoContainer.addEventListener('click', (e) => {
      // Ensure clicking the logo doesn't accidentally trigger parent links
      e.stopPropagation();
      window.playFullSequence();
    });
  }

const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

  /* ── Intersection Observer ── */
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

  function updateUI(isLoggedIn, userData = {}) {
  const loggedInLinks = document.getElementById('loggedInLinks');
  const loggedOutLinks = document.getElementById('loggedOutLinks');
  const profileIconContainer = document.querySelector('.profile-icon');

  // Force boolean check: handles true, "true", or 1
  const authenticated = isLoggedIn === true || userData.loggedIn === true;

  if (authenticated) {
    if (loggedInLinks) loggedInLinks.style.display = 'flex';
    if (loggedOutLinks) loggedOutLinks.style.display = 'none';
    
    const userColor = userData.themeColor || "#2563eb";
    
    // Injecting the SVG with fixed alignment
    profileIconContainer.innerHTML = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
          <circle cx="50" cy="35" r="18" fill="none" stroke="${userColor}" stroke-width="10" />
          <path d="M20 85 C20 60 80 60 80 85" fill="none" stroke="${userColor}" stroke-width="10" stroke-linecap="round" />
      </svg>
    `;
    profileIconContainer.style.borderColor = userColor;
    profileIconContainer.style.background = "#ffffff";

  } else {
    // Guest State
    if (loggedInLinks) loggedInLinks.style.display = 'none';
    if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
    
    profileIconContainer.innerHTML = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
          <circle cx="50" cy="35" r="18" fill="none" stroke="#cbd5e1" stroke-width="6" />
          <path d="M20 85 C20 60 80 60 80 85" fill="none" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round" />
      </svg>
    `;
    profileIconContainer.style.borderColor = "#cbd5e1";
    profileIconContainer.style.background = "#f1f5f9";
  }
}

// Update your checkAuth call to pass the whole user object
async function checkAuth() {
  try {
    const response = await fetch('/api/me');
    if (!response.ok) throw new Error('Not logged in');
    const data = await response.json(); // Data should include { loggedIn: true, themeColor: "#..." }

    updateUI(data.loggedIn, data); 
  } catch (e) {
    updateUI(false);
  }
}

/* ── Logout Handler ── */
async function handleLogout(e) {
  if (e) e.preventDefault();
  try {
    const response = await fetch('/api/logout');
    localStorage.removeItem('pal_user');
    window.location.reload();
  } catch (err) {
    window.location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}); // Added ); here

// Add this at the bottom of the script.js to trigger the check
window.addEventListener('load', () => {
  checkAuth();
  if (hasHeroAnimation) window.playFullSequence();
});

})();