// ============================================================
// SHOWPAY 2.0 — ADMIN TRASH JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showLoader, hideLoader, showToast } from './auth.js';
requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

async function loadTrash() {
  showLoader();
  const { data } = await supabase.from('trash').select('*').order('deleted_at', { ascending: false });
  hideLoader();
  const tbody = document.getElementById('trash-tbody');
  if (!tbody) return;
  if (!data?.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">Trash is empty</td></tr>'; return; }
  tbody.innerHTML = data.map((t, i) => `
    <tr>
      <td style="color:#94a3b8;">${i+1}</td>
      <td><span class="badge badge-pending">${t.original_table}</span></td>
      <td style="font-family:monospace;font-size:12px;color:#64748b;">${JSON.stringify(t.record_data).slice(0,80)}...</td>
      <td style="font-size:12px;color:#94a3b8;">${new Date(t.deleted_at).toLocaleString('en-IN')}</td>
      <td><button class="btn btn-danger btn-sm" onclick="permanentDelete('${t.id}')">Purge</button></td>
    </tr>
  `).join('');
}

window.permanentDelete = async (id) => {
  if (!confirm('Permanently delete?')) return;
  showLoader();
  await supabase.from('trash').delete().eq('id', id);
  hideLoader();
  showToast('Permanently deleted', 'success');
  loadTrash();
};

loadTrash();
