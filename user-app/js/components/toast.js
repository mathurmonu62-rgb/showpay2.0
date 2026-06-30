// ============================================================
// SHOWPAY 2.0 — TOAST NOTIFICATION
// ============================================================

/**
 * Show a toast notification
 * @param {string} message
 * @param {'default'|'success'|'error'} type
 * @param {number} duration ms
 */
export function showToast(message, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'default' ? type : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
