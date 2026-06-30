// ============================================================
// SHOWPAY 2.0 — COMPONENT: SUCCESS POPUP
// ============================================================
import { sleep } from '../utils/helper.js';

const overlay = document.getElementById('success-overlay');

/**
 * Show success popup, auto-hides after duration ms
 * @param {number} duration - ms to show (default 2000)
 * @returns {Promise} resolves after hidden
 */
export async function showSuccessPopup(duration = 2000) {
  overlay.classList.add('active');
  await sleep(duration);
  overlay.classList.remove('active');
}
