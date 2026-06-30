// ============================================================
// SHOWPAY 2.0 — UTILS: HELPER
// ============================================================

/** Sleep n milliseconds */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Format date to readable string */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Truncate string */
export function truncate(str, len = 30) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/** Get setting value by key from array */
export function getSetting(settingsArr, key, fallback = '') {
  const item = settingsArr?.find(s => s.key === key);
  return item ? item.value : fallback;
}
