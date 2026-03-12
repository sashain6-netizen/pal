(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    /* ── Card Animation Logic ── */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.staff-card, .social-card');
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      observer.observe(card);
    });


    /* ── QR Code Modal Logic ── */

    const modal = document.getElementById('qr-modal');
    const qrImage = document.getElementById('qr-image');
    const closeBtn = document.getElementById('qr-close');

    document.querySelectorAll('.social-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();

        const qr = card.getAttribute('data-qr');
        qrImage.src = qr;

        modal.style.display = 'flex';
      });
    });

    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };

  });

})();