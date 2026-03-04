(function () {
  'use strict';

  /* ── Element refs ── */
  const palText = document.getElementById('palText');
  const smilePath = document.getElementById('smilePath');
  const tagline = document.getElementById('tagline');
  const logoContainer = document.getElementById('logoContainer');

  // Check if we are on the home page with the hero
  const hasHeroAnimation = palText && smilePath && logoContainer;

  let shineEl;
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
    // If it's a real link to index.html, let the browser handle it
    // Only scroll if we are already at the top
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

  /* ── Authentication Logic ── */
  async function checkAuth() {
    try {
      // Use a timeout so the fetch doesn't hang the page if the server is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('/api/me', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Not logged in');
      const data = await response.json();

      updateUI(data.loggedIn, data.username);
    } catch (e) {
      console.warn("Auth check skipped (Local mode or API offline)");
      updateUI(false); // Default to logged out state
    }
  }

  function updateUI(isLoggedIn, username = '') {
    const loggedInLinks = document.getElementById('loggedInLinks');
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const profileImg = document.querySelector('.profile-icon img');

    if (isLoggedIn) {
      if (loggedInLinks) loggedInLinks.style.display = 'flex';
      if (loggedOutLinks) loggedOutLinks.style.display = 'none';
      if (profileImg) {
        profileImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      }
    } else {
      if (loggedInLinks) loggedInLinks.style.display = 'none';
      if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
    }
  }

  window.addEventListener('load', () => {
    checkAuth();
    if (hasHeroAnimation) window.playFullSequence();
  });

})();

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
});