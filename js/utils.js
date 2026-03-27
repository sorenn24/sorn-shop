/* ============================================
   SORN.SHOP — utils.js
   Shared utility functions
   ============================================ */

'use strict';

/* ── Format MXN price ── */
export function formatPrice(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(amount);
}

/* ── Debounce ── */
export function debounce(fn, wait = 200) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}

/* ── Throttle ── */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
  };
}

/* ── Clamp ── */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/* ── Lerp ── */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/* ── Generate random int in range ── */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ── Deep clone ── */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ── Sanitize string for HTML ── */
export function sanitize(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

/* ── Get element or throw ── */
export function getEl(selector, parent = document) {
  const el = parent.querySelector(selector);
  if (!el) console.warn(`[SORN] Element not found: ${selector}`);
  return el;
}

/* ── Animate number counter ── */
export function animateCounter(el, from, to, duration = 1500) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString('es-MX');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── Lazy image loader with fallback ── */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('loading' in HTMLImageElement.prototype) return; // Native support

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}

/* ── Smooth scroll to element ── */
export function scrollTo(selector, offset = 80) {
  const el = document.querySelector(selector);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ── Copy text to clipboard ── */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:absolute; opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  }
}
