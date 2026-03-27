/* ============================================
   SORN.SHOP — modal-producto.js
   Product quick-view modal
   ============================================ */

'use strict';

let currentProduct = null;
let selectedTalla  = null;
let selectedColor  = null;
let quantity       = 1;

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('product-modal');
  if (!overlay || !modal) return;

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close button
  document.querySelector('#product-modal .modal__close')
    ?.addEventListener('click', closeModal);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

/* ── Open modal with product ── */
async function openModal(productId) {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('product-modal');
  if (!overlay || !modal) return;

  // Load products
  let products = window._sornProducts;
  if (!products) {
    try {
      const res = await fetch('data/productos.json');
      const data = await res.json();
      products = data.productos;
      window._sornProducts = products;
    } catch { return; }
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;
  selectedTalla  = null;
  selectedColor  = null;
  quantity       = 1;

  renderModal(product);
  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Trap focus
  modal.setAttribute('aria-modal', 'true');
  modal.focus?.();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal   = document.getElementById('product-modal');
  overlay?.classList.remove('open');
  modal?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Render modal content ── */
function renderModal(p) {
  const body = document.getElementById('modal-body');
  if (!body) return;

  const mainImg = p.imagenPrincipal || `https://picsum.photos/seed/${p.id}/600/600`;
  const imgs    = p.imagenes?.length ? p.imagenes : [mainImg];

  const thumbsHtml = imgs.map((img, i) => `
    <div class="modal__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <img
        src="${img}"
        alt="${p.nombre} ${i + 1}"
        loading="lazy"
        onerror="this.src='https://picsum.photos/seed/${p.id}${i}/300/300'"
      >
    </div>
  `).join('');

  const sizesHtml = p.tallas.map(t => `
    <button class="size-option" data-size="${t}">${t}</button>
  `).join('');

  const colorsHtml = p.colores.map(c => `
    <button
      class="color-option"
      data-color="${c.nombre}"
      style="background-color: ${c.hex}; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1)"
      title="${c.nombre}"
      aria-label="Color ${c.nombre}"
    ></button>
  `).join('');

  body.innerHTML = `
    <div class="modal__grid">
      <!-- Gallery -->
      <div class="modal__gallery">
        <img
          class="modal__main-img"
          id="modal-main-img"
          src="${mainImg}"
          alt="${p.nombre}"
          onerror="this.src='https://picsum.photos/seed/${p.id}/600/600'"
        >
        <div class="modal__thumbs">${thumbsHtml}</div>
      </div>

      <!-- Info -->
      <div class="modal__info">
        <div class="modal__tag">
          <span class="badge">${p.categoria}</span>
          ${p.nuevo ? '<span class="badge badge--gold" style="margin-left:6px">Nuevo</span>' : ''}
        </div>

        <h2 class="modal__name">${p.nombre}</h2>

        <div class="modal__price">
          $${p.precio.toLocaleString('es-MX')}
          <span style="font-size:var(--fs-sm); color:var(--clr-text-muted); font-weight:400"> MXN / pieza</span>
        </div>

        <p class="modal__desc">${p.descripcion}</p>

        <div class="divider"></div>

        <!-- Material -->
        <div>
          <p class="selector-label">Material</p>
          <p style="font-size:var(--fs-sm); color:var(--clr-text-sub)">
            ${p.material} &nbsp;·&nbsp; Técnica: ${p.tecnica}
          </p>
        </div>

        <!-- Tallas -->
        <div>
          <p class="selector-label">
            Talla
            ${selectedTalla ? `<span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedTalla}</span>` : ''}
          </p>
          <div class="size-selector" id="size-selector">${sizesHtml}</div>
        </div>

        <!-- Colores -->
        <div>
          <p class="selector-label">
            Color
            ${selectedColor ? `<span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedColor}</span>` : ''}
          </p>
          <div class="color-selector" id="color-selector">${colorsHtml}</div>
        </div>

        <!-- Cantidad -->
        <div>
          <p class="selector-label">Cantidad</p>
          <div class="quantity-control">
            <button class="quantity-btn" id="qty-minus">−</button>
            <input class="quantity-input" id="qty-input" type="number" value="1" min="1" max="999">
            <button class="quantity-btn" id="qty-plus">+</button>
          </div>
        </div>

        <!-- Notas -->
        <div>
          <p class="selector-label">Notas de personalización</p>
          <textarea
            class="notes-textarea"
            id="modal-notes"
            placeholder="Ej: Logo en pecho izquierdo, texto en espalda 'EQUIPO 2026'..."
          ></textarea>
        </div>

        <!-- CTA -->
        <button
          class="btn btn--primary btn--full btn--lg"
          id="modal-add-btn"
          onclick="SORN_MODAL.addToCart()"
        >
          🛒 Agregar al carrito
        </button>
      </div>
    </div>
  `;

  // Events: thumbnail switch
  body.querySelectorAll('.modal__thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      body.querySelectorAll('.modal__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImgEl = document.getElementById('modal-main-img');
      if (mainImgEl) {
        mainImgEl.style.opacity = '0';
        setTimeout(() => {
          mainImgEl.src = imgs[i];
          mainImgEl.style.opacity = '1';
        }, 150);
      }
    });
  });

  // Events: size selection
  body.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTalla = btn.dataset.size;
    });
  });

  // Events: color selection
  body.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  // Events: quantity
  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    quantity = Math.max(1, parseInt(qtyInput.value) - 1);
    qtyInput.value = quantity;
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    quantity = parseInt(qtyInput.value) + 1;
    qtyInput.value = quantity;
  });
  qtyInput?.addEventListener('change', () => {
    quantity = Math.max(1, parseInt(qtyInput.value) || 1);
    qtyInput.value = quantity;
  });
}

/* ── Add to cart from modal ── */
function addToCartFromModal() {
  if (!selectedTalla) {
    window.SORN?.showToast?.('Selecciona una talla', 'error');
    document.getElementById('size-selector')?.classList.add('shake');
    return;
  }
  if (!selectedColor) {
    window.SORN?.showToast?.('Selecciona un color', 'error');
    return;
  }

  const notas = document.getElementById('modal-notes')?.value || '';
  const qty   = parseInt(document.getElementById('qty-input')?.value || '1');

  window.SORN_CART?.add({
    id:          currentProduct.id,
    nombre:      currentProduct.nombre,
    precio:      currentProduct.precio,
    talla:       selectedTalla,
    color:       selectedColor,
    cantidad:    qty,
    notas:       notas,
    imagen:      currentProduct.imagenPrincipal
  });

  window.SORN?.showToast?.(`✓ ${currentProduct.nombre} agregado al carrito`, 'success');

  // Button animation
  const btn = document.getElementById('modal-add-btn');
  if (btn) {
    btn.textContent = '✓ Agregado';
    btn.style.background = 'var(--clr-success)';
    setTimeout(() => {
      btn.innerHTML = '🛒 Agregar al carrito';
      btn.style.background = '';
    }, 2000);
  }

  closeModal();
}

/* ── Expose globally ── */
window.SORN_MODAL = {
  open:      openModal,
  close:     closeModal,
  addToCart: addToCartFromModal
};
