/* ============================================
   SORN.SHOP — main.js
   Init, Custom Cursor, Loading, Scroll Reveal
   ============================================ */

'use strict';

// ── App init ──
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initCursor();
  initNavbar();
  initScrollReveal();
  initCartBadge();
  updateCartCount();
});

/* ── Loading screen ── */
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const fill = screen.querySelector('.loading-bar-fill');
  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
    if (fill) fill.style.width = progress + '%';
  }, 80);

  document.body.style.overflow = 'hidden';
}

/* ── Custom Cursor ── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effects
  const hoverTargets = 'a, button, [role="button"], .product-card, .filter-btn, .size-option, .color-option';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('hover');
      ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });

  // Hide on touch devices
  document.addEventListener('touchstart', () => {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    cancelAnimationFrame(raf);
  }, { once: true });
}

/* ── Navbar scroll behavior ── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);

    // Auto-hide on scroll down, show on scroll up
    if (scrollY > lastScroll && scrollY > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mark active link
  const links = navbar.querySelectorAll('.navbar__link');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

/* ── Cart badge ── */
function initCartBadge() {
  const cartBtn = document.querySelector('.navbar__cart-btn');
  if (!cartBtn) return;

  // Re-render on storage changes (cross-tab)
  window.addEventListener('storage', updateCartCount);
}

function updateCartCount() {
  const count = getCartCount();
  const badge = document.querySelector('.navbar__cart-count');
  if (!badge) return;

  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);

  if (count > 0) {
    badge.style.animation = 'cartBounce 0.4s var(--ease-spring)';
    setTimeout(() => { badge.style.animation = ''; }, 400);
  }
}

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('sorn_cart') || '[]');
    return cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  } catch { return 0; }
}

/* ── Toast notifications ── */
export function showToast(message, type = 'success', duration = 3500) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

/* ── Utility: format price ── */
export function formatPrice(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(amount);
}

/* ── Utility: debounce ── */
export function debounce(fn, wait = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/* ── Expose globals for non-module scripts ── */
window.SORN = window.SORN || {};
window.SORN.showToast    = showToast;
window.SORN.formatPrice  = formatPrice;
window.SORN.updateCartCount = updateCartCount;
window.SORN.getCartCount    = getCartCount;
