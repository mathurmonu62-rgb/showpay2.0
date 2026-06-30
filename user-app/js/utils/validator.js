// ============================================================
// SHOWPAY 2.0 — UTILS: VALIDATOR
// ============================================================

export function isMobile(val) {
  return /^[0-9]{6,15}$/.test(val.trim());
}

export function isEmpty(val) {
  return !val || val.trim().length === 0;
}

export function isValidMpin(val) {
  return /^[0-9]{6}$/.test(val);
}
