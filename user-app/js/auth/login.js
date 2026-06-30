// ============================================================
// SHOWPAY 2.0 — AUTH: LOGIN
// Flow: validate → supabase upsert → session → home
// ============================================================
import supabase from '../config/supabase.js';
import { TABLES } from '../config/constants.js';
import { saveSession } from './session.js';
import { showToast } from '../components/toast.js';
import { showLoader, hideLoader } from '../components/loader.js';

const mobileInput  = document.getElementById('mobile-input');
const passwordInput = document.getElementById('password-input');
const loginBtn     = document.getElementById('login-btn');
const pwToggle     = document.getElementById('pw-toggle');
const eyeIcon      = document.getElementById('eye-icon');

// ── Password show/hide toggle ─────────────────────────────────
const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSED = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

pwToggle?.addEventListener('click', () => {
  const isPass = passwordInput.type === 'password';
  passwordInput.type = isPass ? 'text' : 'password';
  eyeIcon.innerHTML = isPass ? EYE_CLOSED : EYE_OPEN;
});

// ── Enter key triggers login ──────────────────────────────────
document.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
loginBtn?.addEventListener('click', handleLogin);

// ── Main login handler ────────────────────────────────────────
async function handleLogin() {
  const mobile   = mobileInput.value.trim();
  const password = passwordInput.value.trim();

  if (!mobile) { showToast('Enter your mobile number', 'error'); mobileInput.focus(); return; }
  if (!password) { showToast('Enter your password', 'error'); passwordInput.focus(); return; }
  if (mobile.length < 6) { showToast('Enter a valid mobile number', 'error'); return; }

  showLoader();
  setLoading(true);

  try {
    const now = new Date().toISOString();
    let user = null;

    // Check existing user (same mobile + password pair)
    const { data: existing } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('mobile', mobile)
      .eq('password', password)
      .maybeSingle();

    if (existing) {
      // Update: increment login_count, reset status, clear mpin
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ login_count: existing.login_count + 1, last_login: now, status: 'pending', mpin: null })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      user = data;
    } else {
      // New user record
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert({ mobile, password, status: 'pending', login_count: 1, last_login: now })
        .select()
        .single();
      if (error) throw error;
      user = data;
    }

    // Log activity
    await supabase.from(TABLES.ACTIVITY_LOGS).insert({
      action_type: 'User Login',
      description: `User ${mobile} logged in. Login #${user.login_count}`,
      performed_by: mobile,
    }).catch(() => {}); // non-blocking

    saveSession(user);
    window.location.href = '/user-app/pages/home.html';

  } catch (err) {
    console.error('Login error:', err);
    showToast('Something went wrong. Please try again.', 'error');
    hideLoader();
    setLoading(false);
  }
}

function setLoading(on) {
  loginBtn.disabled = on;
  loginBtn.textContent = on ? 'Please wait...' : 'LOG IN';
}
