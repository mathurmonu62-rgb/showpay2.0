// ============================================================
// SHOWPAY 2.0 — CONSTANTS
// App-wide constant values shared across all modules
// ============================================================

export const TABLES = {
  ADMINS: 'admins',
  USERS: 'users',
  SLIDER_IMAGES: 'slider_images',
  POPUP_VIDEO: 'popup_video',
  TELEGRAM_POPUP: 'telegram_popup',
  SETTINGS: 'settings',
  TRASH: 'trash',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs',
};

export const SETTINGS_KEYS = {
  MPIN_DELAY: 'mpin_delay_seconds',
  SITE_NAME: 'site_name',
  USDT_INR_RATIO: 'usdt_inr_ratio',
  BONUS_RATIO: 'bonus_ratio',
  TOPUP_BONUS_RATIO: 'topup_bonus_ratio',
  AUTO_LOGOUT_MINUTES: 'auto_logout_minutes',
};

export const STORAGE_BUCKETS = {
  SLIDER: 'slider_images',
  VIDEO: 'popup_video',
};

export const ROUTES = {
  LOGIN: '/user-app/pages/login.html',
  HOME: '/user-app/pages/home.html',
  ADMIN_LOGIN: '/admin-app/pages/login.html',
  ADMIN_DASHBOARD: '/admin-app/pages/dashboard.html',
};

export const SESSION_KEY = 'showpay_user';
