/* ============================================
   SORN.SHOP — carrito.js
   Cart Management with localStorage
   ============================================ */

'use strict';

const CART_KEY = 'sorn_cart';

/* ── Cart CRUD ── */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  if (window.SORN?.updateCartCount) window.SORN.updateCartCount();
}

export function addToCart(item) {
  const cart = getCart();
  // Check if same product + talla + color + opcionPrenda already exists
  const idx = cart.findIndex(c =>
    c.id === item.id &&
    c.talla === item.talla &&
    c.color === item.color &&
    c.opcionPrenda === item.opcionPrenda
  );

  if (idx !== -1) {
    cart[idx].cantidad += item.cantidad;
  } else {
    cart.push({ ...item, cartId: `${item.id}-${item.talla}-${item.color}-${item.opcionPrenda}-${Date.now()}` });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(cartId) {
  const cart = getCart().filter(item => item.cartId !== cartId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(cartId, cantidad) {
  const cart = getCart();
  const idx  = cart.findIndex(c => c.cartId === cartId);
  if (idx === -1) return cart;

  if (cantidad <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].cantidad = cantidad;
  }
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.cantidad, 0);
}

/* ── Carrito page renderer ── */
document.addEventListener('DOMContentLoaded', () => {
  const cartPage = document.getElementById('cart-page');
  if (!cartPage) return;

  renderCart();
  window.addEventListener('cartUpdated', renderCart);
});

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (emptyState)  emptyState.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (emptyState)  emptyState.style.display = 'none';
  if (cartContent) cartContent.style.display = 'grid';

  container.innerHTML = cart.map(item => `
    <div class="cart-item reveal" data-cart-id="${item.cartId}">
      <img
        class="cart-item__img"
        src="${item.imagen || 'assets/img/productos/placeholder.jpg'}"
        alt="${item.nombre}"
        loading="lazy"
        onerror="this.src=window.SORN_PLACEHOLDER||this.src"
      >
      <div class="cart-item__info">
        <div class="cart-item__name">${item.nombre}</div>
        <div class="cart-item__meta">
          ${item.tipoPrenda === 'polo' ? 'Material' : 'Corte'}: <strong>${item.opcionPrenda}</strong> &nbsp;·&nbsp;
          Talla: <strong>${item.talla}</strong> &nbsp;·&nbsp;
          Color: <strong>${item.color}</strong>
          ${item.disenoNum ? ` &nbsp;·&nbsp; Diseño: <strong>#${item.disenoNum}</strong>` : ''}
          ${item.notas ? `<br>Nota: <em>${item.notas}</em>` : ''}
        </div>
        <div class="cart-item__actions">
          <div class="quantity-control">
            <button class="quantity-btn" onclick="SORN_CART.changeQty('${item.cartId}', ${item.cantidad - 1})">−</button>
            <input class="quantity-input" type="number" value="${item.cantidad}" min="1"
              onchange="SORN_CART.changeQty('${item.cartId}', parseInt(this.value))"
              style="width:44px; height:44px;"
            >
            <button class="quantity-btn" onclick="SORN_CART.changeQty('${item.cartId}', ${item.cantidad + 1})">+</button>
          </div>
          <button class="cart-item__remove" onclick="SORN_CART.remove('${item.cartId}')">
            Eliminar
          </button>
        </div>
      </div>
      <div class="cart-item__subtotal">
        $${(item.precio * item.cantidad).toLocaleString('es-MX')}
      </div>
    </div>
  `).join('');

  // Trigger reveal
  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });

  // Update summary
  updateSummary(cart);

  // Stock note
  if (!document.getElementById('cart-stock-note')) {
    const note = document.createElement('div');
    note.id = 'cart-stock-note';
    note.style.cssText = 'font-size: var(--fs-sm); color: var(--clr-text-sub); margin-top: var(--sp-md); text-align: right; font-style: italic;';
    note.textContent = '* Sujeto a confirmación de stock y colores por WhatsApp.';
    container.parentNode.insertBefore(note, container.nextSibling);
  }
}

function updateSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const count    = cart.reduce((s, i) => s + i.cantidad, 0);

  const elSubtotal  = document.getElementById('summary-subtotal');
  const elCount     = document.getElementById('summary-count');
  const elTotal     = document.getElementById('summary-total');
  const elItemCount = document.getElementById('cart-item-count');

  if (elSubtotal) elSubtotal.textContent = `$${subtotal.toLocaleString('es-MX')}`;
  if (elCount)    elCount.textContent    = `${count} ${count === 1 ? 'prenda' : 'prendas'}`;
  if (elTotal)    elTotal.textContent    = `$${subtotal.toLocaleString('es-MX')}`;
  if (elItemCount) elItemCount.textContent = `(${count})`;
}

/* ── WhatsApp quote builder ── */
export function buildWhatsAppMessage() {
  const cart = getCart();
  if (cart.length === 0) return null;

  let msg = `👋 Hola *SORN.SHOP*, quiero cotizar mi pedido:\n\n`;

  cart.forEach((item, i) => {
    msg += `*${i + 1}. ${item.nombre}*\n`;
    if (item.disenoNum) msg += `   • Diseño: *#${item.disenoNum}*\n`;
    msg += `   • Cantidad: ${item.cantidad} pz\n`;
    msg += `   • ${item.tipoPrenda === 'polo' ? 'Material' : 'Corte'}: ${item.opcionPrenda}\n`;
    msg += `   • Talla: ${item.talla}\n`;
    msg += `   • Color: ${item.color}\n`;
    msg += `   • Precio unitario: $${item.precio.toLocaleString('es-MX')}\n`;
    if (item.notas) msg += `   • Notas: ${item.notas}\n`;
    msg += `\n`;
  });

  const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const count = cart.reduce((s, i) => s + i.cantidad, 0);

  msg += `📦 *Total estimado: $${total.toLocaleString('es-MX')} MXN*\n`;
  msg += `🛍 *Prendas: ${count}*\n\n`;
  msg += `Por favor confirmenme disponibilidad y proceso de pago. ¡Gracias!`;

  return msg;
}

/* ── Expose to window ── */
window.SORN_CART = {
  add:       addToCart,
  remove:    (cartId) => { removeFromCart(cartId); renderCart(); },
  changeQty: (cartId, qty) => { updateQuantity(cartId, qty); renderCart(); },
  clear:     clearCart,
  get:       getCart,
  total:     getCartTotal,
  buildMsg:  buildWhatsAppMessage
};
