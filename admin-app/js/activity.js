// ============================================================
// SHOWPAY 2.0 — ADMIN ACTIVITY LOGS JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';
requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

async function loadLogs() {
  showLoader();
  const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
  hideLoader();
  const tbody = document.getElementById('logs-tbody');
  if (!tbody) return;
  if (!data?.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No activity yet</td></tr>'; return; }
  tbody.innerHTML = data.map((l, i) => `
    <tr>
      <td style="color:#94a3b8;font-size:12px;">${i+1}</td>
      <td><span class="badge badge-completed">${l.action_type}</span></td>
      <td style="font-size:13px;">${l.description}</td>
      <td style="font-size:12px;color:#94a3b8;">${new Date(l.created_at).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');
}

supabase.channel('logs-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, loadLogs).subscribe();
loadLogs();
