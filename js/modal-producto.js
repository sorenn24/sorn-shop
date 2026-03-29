/* ============================================
   SORN.SHOP — modal-producto.js
   Product quick-view modal
   ============================================ */

'use strict';

let currentProduct     = null;
let selectedTalla      = null;
let selectedColor      = null;
let selectedPrendaOption = null; // Corte o Material
let quantity           = 1;
let currentPrice       = 0;
let currentImageIndex  = 0; // Tracks which design photo is active

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
      window._sornVideosCorte = data.videosCorte || {};
    } catch { return; }
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentProduct     = product;
  selectedTalla      = null;
  selectedColor      = null;
  selectedPrendaOption = null;
  quantity           = 1;
  currentPrice       = product.precioBase;
  currentImageIndex  = 0;

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

/* ── Calculate Price ── */
function calculatePrice() {
  if (!currentProduct) return 0;
  
  let basePrice = currentProduct.precioBase;
  let isPlusSize = selectedTalla ? (selectedTalla.includes('2X') || selectedTalla.includes('3X') || selectedTalla.includes('XX')) : false;

  if (currentProduct.tipoPrenda === 'polo') {
    if (selectedPrendaOption === '100% Algodón') {
      basePrice = 380;
      if (isPlusSize) basePrice = 430;
    } else if (selectedPrendaOption === 'Dryfit') {
      basePrice = 490;
      if (isPlusSize) basePrice = 550;
    }
  } else {
    if (selectedPrendaOption === 'Oversize') {
      basePrice = 350;
      if (isPlusSize) basePrice = 380;
    } else if (selectedPrendaOption === 'Regular' || selectedPrendaOption === 'Crop Top') {
      basePrice = 280;
      if (isPlusSize) basePrice = 320;
    }
  }
  
  return basePrice;
}

function updatePriceDisplay() {
  currentPrice = calculatePrice();
  const priceEl = document.getElementById('modal-dynamic-price');
  if (priceEl) {
    priceEl.innerHTML = `$${currentPrice.toLocaleString('es-MX')}`;
  }
}

/* ── Render modal content ── */
function renderModal(p) {
  const body = document.getElementById('modal-body');
  if (!body) return;

  const mainImg = p.imagenPrincipal || window.SORN_PLACEHOLDER;
  const imgs    = p.imagenes?.filter(img => img).length ? p.imagenes : [mainImg];

  const thumbsHtml = imgs.map((img, i) => `
    <div class="modal__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
      <img
        src="${img}"
        alt="${p.nombre} ${i + 1}"
        loading="lazy"
        onerror="this.src=SORN_PLACEHOLDER"
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

  let prendaOptions = [];
  let prendaOptionLabel = '';
  if (p.tipoPrenda === 'polo') {
    prendaOptionLabel = 'Material';
    prendaOptions = ['100% Algodón', 'Dryfit'];
  } else {
    prendaOptionLabel = 'Corte';
    prendaOptions = ['Regular', 'Crop Top', 'Oversize'];
  }

  const prendaOptionsHtml = prendaOptions.map(opt => `
    <button class="prenda-option" data-option="${opt}">${opt}</button>
  `).join('');

  // Initial calculation just in case default isn't selected, show base price range if possible, or leave as is until selected.
  currentPrice = calculatePrice();

  body.innerHTML = `
    <div class="modal__grid">
      <!-- Gallery -->
      <div class="modal__gallery">
        <img
          class="modal__main-img"
          id="modal-main-img"
          src="${mainImg}"
          alt="${p.nombre}"
          onerror="this.src=SORN_PLACEHOLDER"
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
          <span id="modal-dynamic-price">$${currentPrice.toLocaleString('es-MX')}</span>
          <span style="font-size:var(--fs-sm); color:var(--clr-text-muted); font-weight:400"> MXN / pieza</span>
        </div>

        <p class="modal__desc">${p.descripcion}</p>

        <div class="divider"></div>

        <!-- Tipo de Prenda Option -->
        <div>
          <p class="selector-label">
            ${prendaOptionLabel}
            ${selectedPrendaOption ? `<span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedPrendaOption}</span>` : ''}
          </p>
          <div class="prenda-selector" id="prenda-selector">${prendaOptionsHtml}</div>
        </div>

        <!-- Video del corte -->
        <div id="corte-video-wrap" style="display:none; margin-top:var(--sp-md)">
          <p class="selector-label" style="margin-bottom:var(--sp-sm)">
            <i data-lucide="play-circle" style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"></i>
            Así queda este corte
          </p>
          <video
            id="corte-video"
            style="width:100%; border-radius:var(--radius-lg); border:1px solid var(--clr-border); max-height:220px; object-fit:cover; background:#000"
            autoplay
            muted
            loop
            playsinline
            controls
          >
            <source id="corte-video-src" src="" type="video/mp4">
          </video>
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
          <i data-lucide="shopping-cart" style="width:20px;height:20px;vertical-align:-4px;margin-right:8px"></i> Agregar al carrito
        </button>
      </div>
    </div>
  `;

  // Events: thumbnail switch
  body.querySelectorAll('.modal__thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      body.querySelectorAll('.modal__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      currentImageIndex = i; // Track active design #
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

  // Events: prenda option selection
  body.querySelectorAll('.prenda-option').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.prenda-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPrendaOption = btn.dataset.option;
      
      const labelEl = btn.closest('div').previousElementSibling;
      if (labelEl && labelEl.classList.contains('selector-label')) {
        labelEl.innerHTML = `
          ${p.tipoPrenda === 'polo' ? 'Material' : 'Corte'}
          <span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedPrendaOption}</span>
        `;
      }

      // Show video for selected cut
      const videoWrap = document.getElementById('corte-video-wrap');
      const videoEl   = document.getElementById('corte-video');
      const videoSrc  = document.getElementById('corte-video-src');
      const videos    = window._sornVideosCorte || {};
      const videoUrl  = videos[selectedPrendaOption];

      if (videoWrap && videoEl && videoSrc && videoUrl) {
        videoSrc.src = videoUrl;
        videoEl.load();
        videoWrap.style.display = 'block';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else if (videoWrap) {
        videoWrap.style.display = 'none';
      }

      updatePriceDisplay();
    });
  });

  // Events: size selection
  body.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTalla = btn.dataset.size;
      
      const labelEl = btn.closest('#size-selector').previousElementSibling;
      if (labelEl && labelEl.classList.contains('selector-label')) {
        labelEl.innerHTML = `
          Talla
          <span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedTalla}</span>
        `;
      }
      updatePriceDisplay();
    });
  });

  // Events: color selection
  body.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
      
      const labelEl = btn.closest('#color-selector').previousElementSibling;
      if (labelEl && labelEl.classList.contains('selector-label')) {
        labelEl.innerHTML = `
          Color
          <span style="color:var(--clr-gold); margin-left:8px; text-transform:none; letter-spacing:0">${selectedColor}</span>
        `;
      }
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
  const prendaLabel = currentProduct.tipoPrenda === 'polo' ? 'Material' : 'Corte';
  if (!selectedPrendaOption) {
    window.SORN?.showToast?.(`Selecciona un ${prendaLabel}`, 'error');
    document.getElementById('prenda-selector')?.classList.add('shake');
    setTimeout(() => document.getElementById('prenda-selector')?.classList.remove('shake'), 500);
    return;
  }
  if (!selectedTalla) {
    window.SORN?.showToast?.('Selecciona una talla', 'error');
    document.getElementById('size-selector')?.classList.add('shake');
    setTimeout(() => document.getElementById('size-selector')?.classList.remove('shake'), 500);
    return;
  }
  if (!selectedColor) {
    window.SORN?.showToast?.('Selecciona un color', 'error');
    document.getElementById('color-selector')?.classList.add('shake');
    setTimeout(() => document.getElementById('color-selector')?.classList.remove('shake'), 500);
    return;
  }

  const notas      = document.getElementById('modal-notes')?.value || '';
  const qty        = parseInt(document.getElementById('qty-input')?.value || '1');
  const disenoNum  = currentImageIndex + 1; // Human-readable design number
  const imgs       = currentProduct.imagenes?.filter(Boolean) || [];
  const imagenActiva = imgs[currentImageIndex] || currentProduct.imagenPrincipal;

  window.SORN_CART?.add({
    id:           currentProduct.id,
    nombre:       currentProduct.nombre,
    precio:       currentPrice,
    talla:        selectedTalla,
    color:        selectedColor,
    opcionPrenda: selectedPrendaOption,
    tipoPrenda:   currentProduct.tipoPrenda,
    cantidad:     qty,
    notas:        notas,
    disenoNum:    disenoNum,
    imagen:       imagenActiva
  });

  window.SORN?.showToast?.(`✓ ${currentProduct.nombre} agregado al carrito`, 'success');

  // Button animation
  const btn = document.getElementById('modal-add-btn');
  if (btn) {
    btn.textContent = '✓ Agregado';
    btn.style.background = 'var(--clr-success)';
    setTimeout(() => {
      btn.innerHTML = '<i data-lucide="shopping-cart" style="width:20px;height:20px;vertical-align:-4px;margin-right:8px"></i> Agregar al carrito';
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
