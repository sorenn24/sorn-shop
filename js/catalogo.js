/* ============================================
   SORN.SHOP — catalogo.js
   Product loading, filtering, sorting, cards
   ============================================ */

'use strict';

let allProducts = [];
let activeFilter = 'Todos';
let activeSort   = 'default';

/* ── Placeholder when local image is missing ── */
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23555'%3ESin imagen%3C/text%3E%3C/svg%3E";

/* Card image index tracker: productId → currentIdx */
const _cardIdx = {};

document.addEventListener('DOMContentLoaded', async () => {
  const catalogoPage = document.getElementById('catalogo-page');
  if (!catalogoPage) return;

  await loadProducts();
  initFilters();
  initSort();
  renderProducts(allProducts);
  initCardCarousel();
});

/* ── Load from JSON ── */
async function loadProducts() {
  try {
    const res  = await fetch('data/productos.json');
    const data = await res.json();
    allProducts = data.productos;
    window._sornVideosCorte = data.videosCorte || {};
    return allProducts;
  } catch (err) {
    console.error('Error cargando productos:', err);
    allProducts = [];
    return [];
  }
}

/* ── Expose loader for other pages ── */
window.SORN_CATALOGO = { loadProducts: async () => {
  if (allProducts.length) return allProducts;
  return await loadProducts();
}};

/* ── Filter buttons ── */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFiltersAndSort();
    });
  });
}

/* ── Sort select ── */
function initSort() {
  const sortSel = document.getElementById('sort-select');
  if (!sortSel) return;
  sortSel.addEventListener('change', () => {
    activeSort = sortSel.value;
    applyFiltersAndSort();
  });
}

function applyFiltersAndSort() {
  let filtered = [...allProducts];
  if (activeFilter !== 'Todos') {
    filtered = filtered.filter(p =>
      p.categoria === activeFilter ||
      p.etiquetas.some(e => e === activeFilter)
    );
  }
  switch (activeSort) {
    case 'precio-asc':  filtered.sort((a,b) => a.precio - b.precio); break;
    case 'precio-desc': filtered.sort((a,b) => b.precio - a.precio); break;
    case 'nuevo':       filtered.sort((a,b) => (b.nuevo?1:0) - (a.nuevo?1:0)); break;
    default:            filtered.sort((a,b) => (b.destacado?1:0) - (a.destacado?1:0));
  }
  renderProducts(filtered);
  initCardCarousel();
}

/* ── Render cards ── */
function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">👕</div>
        <h3 class="empty-state__title">Sin productos</h3>
        <p class="empty-state__text">No encontramos productos con esos filtros.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map((p, i) => createProductCard(p, i)).join('');

  // Fade-in & scroll reveal with stagger
  requestAnimationFrame(() => {
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 60);
    });
    // Fade-in for images once loaded (#6)
    grid.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        img.classList.add('img-loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('img-loaded'));
      }
    });
  });
}

/* ── Product card template ── */
export function createProductCard(p, idx = 0) {
  const imgs   = p.imagenes?.filter(Boolean).length ? p.imagenes : [p.imagenPrincipal || PLACEHOLDER];
  const imgSrc = imgs[0] || PLACEHOLDER;
  const total  = imgs.length;

  // Store images for carousel
  _cardIdx[p.id] = 0;
  window._sornCardImages = window._sornCardImages || {};
  window._sornCardImages[p.id] = imgs;

  const badgesHtml = [
    p.nuevo     ? `<span class="badge badge--gold">Nuevo</span>` : '',
    p.destacado ? `<span class="badge">Destacado</span>` : ''
  ].filter(Boolean).join('');

  const tagsHtml = p.etiquetas.slice(0, 3).map(e =>
    `<span class="badge">${e}</span>`
  ).join('');

  // Dots for carousel
  const dotsHtml = total > 1
    ? `<div class="card-dots" aria-hidden="true">${imgs.map((_,i) =>
        `<span class="card-dot ${i===0?'active':''}"></span>`).join('')}</div>`
    : '';

  // Count badge
  const countBadge = total > 1
    ? `<span class="card-count-badge">${total} diseños</span>`
    : '';

  // Carousel arrows
  const arrowsHtml = total > 1 ? `
    <button class="card-arrow card-arrow--prev" data-id="${p.id}" aria-label="Diseño anterior" tabindex="-1">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="card-arrow card-arrow--next" data-id="${p.id}" aria-label="Siguiente diseño" tabindex="-1">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>` : '';

  return `
    <article class="product-card reveal" data-id="${p.id}" style="transition-delay: ${idx * 40}ms">
      <div class="product-card__image-wrap">
        <img
          class="product-card__image img-fade"
          id="card-img-${p.id}"
          src="${imgSrc}"
          alt="${p.nombre}"
          loading="lazy"
          onerror="this.src=SORN_PLACEHOLDER"
        >
        ${countBadge}
        <div class="product-card__badges">${badgesHtml}</div>
        ${arrowsHtml}
        ${dotsHtml}
        <div class="product-card__actions">
          <button
            class="product-card__action-btn"
            title="Vista rápida"
            onclick="SORN_MODAL.open('${p.id}')"
            aria-label="Vista rápida de ${p.nombre}"
          ><i data-lucide="eye" style="width:20px;height:20px;pointer-events:none;"></i></button>
          <button
            class="product-card__action-btn"
            title="Agregar al carrito"
            onclick="SORN_MODAL.open('${p.id}')"
            aria-label="Agregar ${p.nombre} al carrito"
          ><i data-lucide="shopping-cart" style="width:20px;height:20px;pointer-events:none;"></i></button>
        </div>
      </div>
      <div class="product-card__body">
        <div class="product-card__category">${p.categoria}</div>
        <h3 class="product-card__name">${p.nombre}</h3>
        <div class="product-card__tags">${tagsHtml}</div>
        <div class="product-card__footer">
          <div class="product-card__price">
            <span class="product-card__price-from">Desde</span>
            <span class="product-card__price-amount">
              <sup>$</sup>${p.precio.toLocaleString('es-MX')}
            </span>
          </div>
          <button
            class="product-card__btn"
            onclick="SORN_MODAL.open('${p.id}')"
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ── Card Carousel (event delegation) ── */
function initCardCarousel() {
  const grid = document.getElementById('products-grid') ||
               document.getElementById('featured-grid');
  if (!grid || grid._carouselBound) return;
  grid._carouselBound = true;

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.card-arrow');
    if (!btn) return;
    e.stopPropagation();

    const id   = btn.dataset.id;
    const imgs = window._sornCardImages?.[id];
    if (!imgs || imgs.length <= 1) return;

    const isNext = btn.classList.contains('card-arrow--next');
    let idx = _cardIdx[id] ?? 0;
    idx = isNext ? (idx + 1) % imgs.length : (idx - 1 + imgs.length) % imgs.length;
    _cardIdx[id] = idx;

    // Update image with fade
    const imgEl = document.getElementById(`card-img-${id}`);
    if (imgEl) {
      imgEl.classList.remove('img-loaded');
      setTimeout(() => {
        imgEl.src = imgs[idx];
        imgEl.onload = () => imgEl.classList.add('img-loaded');
        imgEl.onerror = () => { imgEl.src = PLACEHOLDER; imgEl.classList.add('img-loaded'); };
      }, 150);
    }

    // Update dots
    const card = btn.closest('.product-card');
    card?.querySelectorAll('.card-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  });
}

/* ── Expose placeholder globally for onerror handlers ── */
window.SORN_PLACEHOLDER = PLACEHOLDER;
