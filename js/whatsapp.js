/* ============================================
   SORN.SHOP — whatsapp.js
   WhatsApp quote generation & redirect
   ============================================ */

'use strict';

const WA_NUMBER = '5218112345678'; // Número de WhatsApp de SORN.SHOP

document.addEventListener('DOMContentLoaded', () => {
  // Carrito: botón "Cotizar por WhatsApp"
  const waBtn = document.getElementById('wa-quote-btn');
  waBtn?.addEventListener('click', sendCartToWhatsApp);
});

/* ── Send full cart to WhatsApp ── */
function sendCartToWhatsApp() {
  const msg = window.SORN_CART?.buildMsg?.();
  if (!msg) {
    window.SORN?.showToast?.('Tu carrito está vacío', 'error');
    return;
  }
  openWhatsApp(msg);
}

/* ── Send single product to WhatsApp ── */
export function sendProductToWhatsApp(product, talla, color, cantidad, notas) {
  let msg = `👋 Hola *SORN.SHOP*, me interesa cotizar:\n\n`;
  msg += `*${product.nombre}*\n`;
  msg += `• Cantidad: ${cantidad} pz\n`;
  msg += `• Talla: ${talla}\n`;
  msg += `• Color: ${color}\n`;
  if (notas) msg += `• Notas: ${notas}\n`;
  msg += `\n¿Cuál es el precio y tiempo de entrega? ¡Gracias!`;

  openWhatsApp(msg);
}

/* ── Generic contact message ── */
export function sendContactToWhatsApp(nombre, email, mensaje) {
  let msg = `👋 Hola *SORN.SHOP*!\n\n`;
  msg += `Mi nombre es *${nombre}*\n`;
  if (email) msg += `Email: ${email}\n`;
  msg += `\n${mensaje}`;

  openWhatsApp(msg);
}

/* ── Core: open WhatsApp link ── */
function openWhatsApp(message) {
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodedMsg}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ── Expose globally ── */
window.SORN_WA = {
  sendCart:    sendCartToWhatsApp,
  sendProduct: sendProductToWhatsApp,
  sendContact: sendContactToWhatsApp,
  open:        openWhatsApp
};
