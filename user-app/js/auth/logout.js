// ============================================================
// SHOWPAY 2.0 — AUTH: LOGOUT
// ============================================================
import { clearSession } from './session.js';

/**
 * Logout user: clear session and redirect to login
 */
export function logout() {
  clearSession();
  window.location.href = '/user-app/pages/login.html';
}
