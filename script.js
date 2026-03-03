(function () {
  'use strict';

  /* ── Element refs (Wrapped in a check for safety) ── */
  const palText = document.getElementById('palText');
  const smilePath = document.getElementById('smilePath');
  const tagline = document.getElementById('tagline');
  const logoContainer = document.getElementById('logoContainer');

  // Only setup animations if the elements actually exist (e.g., on the Home page)
  const hasHeroAnimation = palText && smilePath && logoContainer;

  let shineEl;
  if (hasHeroAnimation) {
    shineEl = document.createElement('div');
    shineEl.className = 'shine-overlay';
    logoContainer.appendChild(shineEl);
  }

  /* ── Master sequence (The "Reload") ── */
  window.playFullSequence = function() {
    if (!hasHeroAnimation) return; // Exit if not on home page

    tagline.classList.remove('visible');
    smilePath.style.transition = 'none';
    const length = smilePath.getTotalLength();
    smilePath.style.strokeDasharray = length;
    smilePath.style.strokeDashoffset = length;

    palText.classList.remove('squeezing');
    void palText.offsetWidth; 
    palText.classList.add('squeezing');

    // Run Shine
    shineEl.classList.remove('shining');
    void shineEl.offsetWidth;
    shineEl.classList.add('shining');

    setTimeout(() => {
      // Run Smile
      smilePath.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      smilePath.style.strokeDashoffset = '0';
      
      setTimeout(() => {
        tagline.classList.add('visible');
      }, 500);
    }, 400); 
  };

  /* ── Listeners ── */
  if (hasHeroAnimation) {
    logoContainer.addEventListener('click', playFullSequence);
    logoContainer.style.cursor = 'pointer';
    logoContainer.style.transition = 'transform 0.3s ease';
    logoContainer.addEventListener('mouseenter', () => logoContainer.style.transform = 'translateY(-5px)');
    logoContainer.addEventListener('mouseleave', () => logoContainer.style.transform = 'translateY(0)');
  }

  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof window.playFullSequence === 'function') window.playFullSequence();
    });
  }

  /* ── Intersection Observer (For Team Cards) ── */
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

  /* ── Authentication Logic ── */
  async function checkAuth() {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();

      const loggedInLinks = document.getElementById('loggedInLinks');
      const loggedOutLinks = document.getElementById('loggedOutLinks');
      const profileImg = document.querySelector('.profile-icon img');

      if (data.loggedIn) {
        if (loggedInLinks) loggedInLinks.style.display = 'block';
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        if (profileImg) {
          profileImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`;
        }
      } else {
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (loggedOutLinks) loggedOutLinks.style.display = 'block';
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
  }

  // Run on load
  window.addEventListener('load', () => {
    checkAuth();
    if (hasHeroAnimation) playFullSequence();
  });

})();

// Function to handle the actual logout
async function handleLogout(e) {
  if (e) e.preventDefault(); // Stop the page from jumping to the top (#)

  try {
    // 1. Tell the Cloudflare Function to clear the cookie
    const response = await fetch('/api/logout');
    
    if (response.ok) {
      // 2. Clear any local data (optional)
      localStorage.removeItem('pal_user');
      
      // 3. Refresh the page to reset the UI to "Logged Out" state
      window.location.reload();
    }
  } catch (err) {
    console.error("Logout failed:", err);
    // Fallback: just reload if the API fails
    window.location.reload();
  }
}

// Attach the listener to the button
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});