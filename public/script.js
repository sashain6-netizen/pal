(function () {
  'use strict';

  /* ── Element refs ── */
  const palText = document.getElementById('palText');
  const smilePath = document.getElementById('smilePath');
  const tagline = document.getElementById('tagline');
  const logoContainer = document.getElementById('logoContainer');
  const shineEl = document.getElementById('shineEl');

  const hasHeroAnimation = palText && smilePath && logoContainer;

  /* ── Master sequence ── */
  window.playFullSequence = function() {
    if (!hasHeroAnimation) return;

    tagline.classList.remove('visible');
    
    let length = 0;
    try {
      length = smilePath.getTotalLength();
    } catch (e) {
      length = 500;
    }

    smilePath.style.transition = 'none';
    smilePath.style.strokeDasharray = length;
    smilePath.style.strokeDashoffset = length;

    palText.classList.remove('squeezing');
    void palText.offsetWidth; // Trigger reflow
    palText.classList.add('squeezing');

    shineEl.classList.remove('shining');
    void shineEl.offsetWidth; // Trigger reflow
    shineEl.classList.add('shining');

    setTimeout(() => {
      smilePath.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      smilePath.style.strokeDashoffset = '0';
      
      setTimeout(() => {
        tagline.classList.add('visible');
      }, 500);
    }, 400); 
  };

  /* ── Interaction Listeners ── */
  if (hasHeroAnimation) {
    logoContainer.style.cursor = 'pointer';
    logoContainer.style.transition = 'transform 0.3s ease';

    // Combine enter/leave and click into one logic block
    logoContainer.addEventListener('mouseenter', () => logoContainer.style.transform = 'translateY(-5px)');
    logoContainer.addEventListener('mouseleave', () => logoContainer.style.transform = 'translateY(0)');
    
    logoContainer.addEventListener('click', (e) => {
      // Don't trigger if user clicked a link inside the logo area
      if (e.target.closest('a')) return; 
      e.stopPropagation();
      window.playFullSequence();
    });
  }

  // Navbar logo scroll-to-top logic
  // We use a delegated listener because navbar.js might inject the logo after this runs
  document.addEventListener('click', (e) => {
    const navLogo = e.target.closest('.nav-logo');
    if (navLogo && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

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

  /* ── Initialization ── */
  window.addEventListener('load', () => {
    if (hasHeroAnimation) window.playFullSequence();
  });

})();