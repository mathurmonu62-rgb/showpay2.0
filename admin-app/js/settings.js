// ============================================================
// SHOWPAY 2.0 — ADMIN SETTINGS.JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

async function loadSettings() {
  showLoader();
  const { data } = await supabase.from('settings').select('*');
  hideLoader();
  if (!data) return;
  data.forEach(row => {
    const input = document.querySelector(`[data-key="${row.key}"]`);
    if (input) input.value = row.value;
  });
}

document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
  const inputs = document.querySelectorAll('[data-key]');
  showLoader();
  try {
    for (const input of inputs) {
      const key = input.dataset.key;
      const value = input.value.trim();
      if (!value) continue;
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    await supabase.from('activity_logs').insert({
      action_type: 'Settings Updated',
      description: 'App settings were updated by admin',
      performed_by: admin?.email || 'Admin',
    }).catch(() => {});
    showToast('Settings saved successfully!', 'success');
  } catch (err) {
    console.error(err); showToast('Failed to save settings', 'error');
  } finally { hideLoader(); }
});

loadSettings();
