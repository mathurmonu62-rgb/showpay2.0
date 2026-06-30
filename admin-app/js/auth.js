// ============================================================
// SHOWPAY 2.0 — ADMIN AUTH
// ============================================================
import supabase from './supabase.js';

const ADMIN_SESSION = 'showpay_admin';

export function saveAdminSession(admin) {
  sessionStorage.setItem(ADMIN_SESSION, JSON.stringify(admin));
}

export function getAdminSession() {
  try { return JSON.parse(sessionStorage.getItem(ADMIN_SESSION)); } catch { return null; }
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION);
}

export function requireAdminAuth() {
  if (!getAdminSession()) {
    window.location.href = '/admin-app/pages/login.html';
  }
}

// ── Toast helper ──────────────────────────────────────────
export function showToast(msg, type = 'default') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type !== 'default' ? type : ''}`;
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

export function showLoader() { document.getElementById('global-loader')?.classList.add('active'); }
export function hideLoader() { document.getElementById('global-loader')?.classList.remove('active'); }

// ── Login page logic ──────────────────────────────────────
const loginBtn = document.getElementById('admin-login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', handleAdminLogin);
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAdminLogin(); });
}

async function handleAdminLogin() {
  const email    = document.getElementById('admin-email')?.value.trim();
  const password = document.getElementById('admin-password')?.value.trim();

  if (!email || !password) { showToast('Enter email and password', 'error'); return; }

  showLoader();
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error) throw error;
    if (!data) { showToast('Invalid email or password', 'error'); return; }

    saveAdminSession(data);

    await supabase.from('activity_logs').insert({
      action_type: 'Admin Login',
      description: `Admin ${email} logged in`,
      performed_by: email,
    }).catch(() => {});

    window.location.href = '/admin-app/pages/dashboard.html';
  } catch (err) {
    console.error(err);
    showToast('Login failed. Try again.', 'error');
  } finally {
    hideLoader();
    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Login to Admin'; }
  }
}
