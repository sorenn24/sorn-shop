/* ============================================
   SORN.SHOP — menu.js
   Mobile Menu Toggle
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});

function initMobileMenu() {
  const burger     = document.querySelector('.navbar__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navbar     = document.querySelector('.navbar');
  const overlay    = document.querySelector('.mobile-menu-overlay');

  if (!burger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    navbar.classList.add('menu-open');
    document.body.style.overflow = 'hidden';

    // Stagger animate links
    const links = mobileMenu.querySelectorAll('.mobile-menu__link');
    links.forEach((link, i) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(30px)';
      setTimeout(() => {
        link.style.transition = `opacity 0.4s ease ${i * 0.08}s, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, 50);
    });
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    navbar.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on overlay click (if overlay exists)
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
