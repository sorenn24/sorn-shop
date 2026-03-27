/* ============================================
   SORN.SHOP — catalogo.js
   Product loading, filtering, sorting, cards
   ============================================ */

'use strict';

let allProducts = [];
let activeFilter = 'Todos';
let activeSort = 'default';

document.addEventListener('DOMContentLoaded', async () => {
  const catalogoPage = document.getElementById('catalogo-page');
  if (!catalogoPage) return;

  await loadProducts();
  initFilters();
  initSort();
  renderProducts(allProducts);
});

/* ── Load from JSON ── */
async function loadProducts() {
  try {
    const res = await fetch('data/productos.json');
    const data = await res.json();
    allProducts = data.productos;
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

  // Filter
  if (activeFilter !== 'Todos') {
    filtered = filtered.filter(p =>
      p.categoria === activeFilter ||
      p.etiquetas.some(e => e === activeFilter)
    );
  }

  // Sort
  switch (activeSort) {
    case 'precio-asc':
      filtered.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      filtered.sort((a, b) => b.precio - a.precio);
      break;
    case 'nuevo':
      filtered.sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));
      break;
    default:
      filtered.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
  }

  renderProducts(filtered);
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

  // Trigger scroll reveal with stagger
  requestAnimationFrame(() => {
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 60);
    });
  });
}

/* ── Product card template ── */
export function createProductCard(p, idx = 0) {
  const imgSrc = p.imagenPrincipal || `https://picsum.photos/seed/${p.id}/400/500`;
  const img2   = p.imagenes?.[1] || imgSrc;

  const badgesHtml = [
    p.nuevo     ? `<span class="badge badge--gold">Nuevo</span>` : '',
    p.destacado ? `<span class="badge">Destacado</span>` : ''
  ].filter(Boolean).join('');

  const tagsHtml = p.etiquetas.slice(0, 3).map(e =>
    `<span class="badge">${e}</span>`
  ).join('');

  return `
    <article class="product-card reveal" style="transition-delay: ${idx * 40}ms">
      <div class="product-card__image-wrap">
        <img
          class="product-card__image"
          src="${imgSrc}"
          alt="${p.nombre}"
          loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${p.id}/400/500'"
        >
        <img
          class="product-card__image-hover"
          src="${img2}"
          alt="${p.nombre} back"
          loading="lazy"
          onerror="this.src='https://picsum.photos/seed/${p.id}b/400/500'"
        >
        <div class="product-card__badges">${badgesHtml}</div>
        <div class="product-card__actions">
          <button
            class="product-card__action-btn"
            title="Vista rápida"
            onclick="SORN_MODAL.open('${p.id}')"
            aria-label="Vista rápida de ${p.nombre}"
          >👁</button>
          <button
            class="product-card__action-btn"
            title="Agregar al carrito"
            onclick="SORN_MODAL.open('${p.id}')"
            aria-label="Agregar ${p.nombre} al carrito"
          >🛒</button>
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
