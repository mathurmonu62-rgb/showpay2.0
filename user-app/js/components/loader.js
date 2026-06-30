// ============================================================
// SHOWPAY 2.0 — GLOBAL LOADER
// ============================================================

const loader = document.getElementById('global-loader');

export function showLoader() {
  if (loader) loader.classList.add('active');
}

export function hideLoader() {
  if (loader) loader.classList.remove('active');
}
