// ============================================================
// SHOWPAY 2.0 — SESSION MANAGER
// Stores user data in sessionStorage during active session
// ============================================================

const SESSION_KEY = 'showpay_user';

/**
 * Save user object to session
 * @param {Object} user
 */
export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Get current session user object
 * @returns {Object|null}
 */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Guard: if not logged in, redirect to login page
 */
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/user-app/pages/login.html';
  }
}
