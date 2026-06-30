// ============================================================
// SHOWPAY 2.0 — COMPONENT: TELEGRAM POPUP
// Shows telegram card if telegram_popup.is_enabled = true
// ============================================================

const overlay  = document.getElementById('tg-popup-overlay');
const imgEl    = document.getElementById('tg-img');
const titleEl  = document.getElementById('tg-title');
const descEl   = document.getElementById('tg-desc');
const joinBtn  = document.getElementById('tg-join-btn');
const closeBtn = document.getElementById('tg-close-btn');

let onCloseCallback = null;

/**
 * Show telegram popup if enabled
 * @param {Object} tgData - row from telegram_popup table
 * @param {Function} onClose - callback when closed
 */
export function showTelegramPopup(tgData, onClose) {
  if (!tgData?.is_enabled) {
    onClose?.();
    return;
  }

  onCloseCallback = onClose;

  if (tgData.image_url)    imgEl.src       = tgData.image_url;
  if (tgData.title)        titleEl.textContent = tgData.title;
  if (tgData.description)  descEl.textContent  = tgData.description;
  if (tgData.telegram_link) joinBtn.href    = tgData.telegram_link;

  overlay.classList.add('active');
}

export function hideTelegramPopup() {
  overlay.classList.remove('active');
  onCloseCallback?.();
  onCloseCallback = null;
}

closeBtn?.addEventListener('click', hideTelegramPopup);
joinBtn?.addEventListener('click', () => {
  setTimeout(hideTelegramPopup, 500);
});
