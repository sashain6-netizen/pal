(function () {
  'use strict';

  /* ── Element refs ─────────────────────────────────────────── */
  const palText       = document.getElementById('palText');
  const smilePath     = document.getElementById('smilePath');
  const tagline       = document.getElementById('tagline');
  const logoContainer = document.getElementById('logoContainer');

  /* ── Setup Shine Overlay ───────────────────────────────────── */
  const shineEl = document.createElement('div');
  shineEl.className = 'shine-overlay';
  logoContainer.appendChild(shineEl);

  /* ── Phase 1: Squeeze Entrance ─────────────────────────────── */
  function runSqueeze(onDone) {
    palText.classList.remove('squeezing');
    void palText.offsetWidth; // Force reflow
    palText.classList.add('squeezing');
    
    // Use a simple timeout matching the CSS duration (1s)
    setTimeout(() => {
      if (onDone) onDone();
    }, 1000);
  }

  /* ── Phase 2: Draw the smile ───────────────────────────────── */
  function runSmile() {
    // Instead of measuring, we use the path's own length for precision
    const length = smilePath.getTotalLength();
    smilePath.style.strokeDasharray = length;
    smilePath.style.strokeDashoffset = length;
    
    requestAnimationFrame(() => {
      smilePath.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      smilePath.style.strokeDashoffset = '0';
    });
  }

  /* ── Phase 3: Shine sweep ───────────────────────────────────── */
  function runShine() {
    shineEl.classList.remove('shining');
    void shineEl.offsetWidth;
    shineEl.classList.add('shining');
  }

  /* ── Master sequence (The "Reload") ─────────────────────────── */
  /* ── Master sequence (The "Reload") ─────────────────────────── */
  function playFullSequence() {
    // 1. Reset all states immediately
    tagline.classList.remove('visible');
    
    // Reset the smile path
    smilePath.style.transition = 'none';
    const length = smilePath.getTotalLength();
    smilePath.style.strokeDasharray = length;
    smilePath.style.strokeDashoffset = length;

    // 2. THE FIX: Reset the PAL text animation
    palText.classList.remove('squeezing');
    
    // This line forces the browser to "notice" the class was removed
    void palText.offsetWidth; 
    
    // Now add it back to trigger the boing
    palText.classList.add('squeezing');

    // 3. Run the supporting animations
    runShine();

    // Delay the smile and tagline so they follow the "boing"
    setTimeout(() => {
      runSmile();
      setTimeout(() => {
        tagline.classList.add('visible');
      }, 500);
    }, 400); 
  }

  /* ── Listener ─────────────────────────────────────────── */
  logoContainer.addEventListener('click', () => {
    playFullSequence();
  });

  /* ── Init: Only run on load ────────────────────────────────── */
  window.addEventListener('load', () => {
    playFullSequence();
  });

  // 2. MODERN HOVER: Just a subtle "lift" effect via CSS
  // (We don't need JS for the hover anymore, making it less glitchy)
  logoContainer.style.cursor = 'pointer';
  logoContainer.style.transition = 'transform 0.3s ease';
  
  logoContainer.addEventListener('mouseenter', () => {
    logoContainer.style.transform = 'translateY(-5px)';
  });
  
  logoContainer.addEventListener('mouseleave', () => {
    logoContainer.style.transform = 'translateY(0)';
  });

})();

document.querySelector('.nav-logo').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  playFullSequence();
});