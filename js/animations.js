/* ============================================
   SORN.SHOP — animations.js
   Hero slider, parallax, micro-interactions
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initParallax();
  initProductCardTilt();
  initNavbarTransition();
});

/* ── Subtle parallax on hero elements ── */
function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const bg      = hero.querySelector('.hero__bg-img');
  const content = hero.querySelector('.hero__content');
  const glow    = hero.querySelector('.hero__glow');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (bg)      bg.style.transform      = `scale(1.05) translateY(${y * 0.25}px)`;
    if (content) content.style.transform = `translateY(${y * 0.08}px)`;
    if (glow)    glow.style.transform    = `translateY(${y * 0.12}px)`;
  }, { passive: true });
}

/* ── 3D tilt effect on product cards ── */
function initProductCardTilt() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    const rect  = card.getBoundingClientRect();
    const x     = e.clientX - rect.left;
    const y     = e.clientY - rect.top;
    const cx    = rect.width  / 2;
    const cy    = rect.height / 2;
    const rotX  = ((y - cy) / cy) * -4;  // max 4deg
    const rotY  = ((x - cx) / cx) *  4;

    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest?.('.product-card');
    if (card) card.style.transform = '';
  }, true);

  // Reset on card mouse-leave
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── Smooth navbar background transition ── */
function initNavbarTransition() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Already handled in main.js, this adds the transition property
  navbar.style.transition = [
    'background 0.4s cubic-bezier(0.16,1,0.3,1)',
    'padding 0.4s cubic-bezier(0.16,1,0.3,1)',
    'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
    'border-bottom 0.4s',
    'backdrop-filter 0.4s'
  ].join(', ');
}

/* ── Pulse glow on CTA buttons ── */
export function pulseButton(btn) {
  btn.style.animation = 'borderGlow 0.6s ease';
  setTimeout(() => btn.style.animation = '', 600);
}

/* ── Text scramble effect ── */
export function scrambleText(el, finalText, duration = 600) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  const steps = 12;
  const interval = duration / steps;
  let step = 0;

  const tick = setInterval(() => {
    el.textContent = finalText
      .split('')
      .map((char, i) => {
        if (i < (step / steps) * finalText.length) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (++step > steps) {
      clearInterval(tick);
      el.textContent = finalText;
    }
  }, interval);
}
