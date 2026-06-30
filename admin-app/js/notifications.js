// ============================================================
// SHOWPAY 2.0 — ADMIN NOTIFICATIONS JS
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';
requireAdminAuth();
const admin = getAdminSession();
if (admin) { const n = document.getElementById('admin-name'); if (n) n.textContent = admin.email?.split('@')[0]; }
document.getElementById('logout-link')?.addEventListener('click', (e) => { e.preventDefault(); clearAdminSession(); window.location.href = '/admin-app/pages/login.html'; });

const saveBtn = document.getElementById('save-notif-btn');
const addForm = document.getElementById('add-notif-form');
const addBtn  = document.getElementById('add-notif-btn');
const cancelBtn = document.getElementById('cancel-notif-btn');

addBtn?.addEventListener('click', () => { addForm.style.display = 'block'; });
cancelBtn?.addEventListener('click', () => { addForm.style.display = 'none'; });

async function loadNotifications() {
  showLoader();
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  hideLoader();
  const tbody = document.getElementById('notif-tbody');
  if (!tbody) return;
  if (!data?.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#94a3b8;">No notifications</td></tr>'; return; }
  tbody.innerHTML = data.map((n, i) => `
    <tr>
      <td style="color:#94a3b8;">${i+1}</td>
      <td style="font-weight:600;">${n.title}</td>
      <td style="font-size:13px;color:#64748b;">${n.message}</td>
      <td>
        <label class="toggle"><input type="checkbox" ${n.is_enabled ? 'checked' : ''} onchange="toggleNotif('${n.id}',this.checked)"/><span class="toggle-slider"></span></label>
      </td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteNotif('${n.id}')">Delete</button></td>
    </tr>
  `).join('');
}

saveBtn?.addEventListener('click', async () => {
  const title   = document.getElementById('notif-title')?.value.trim();
  const message = document.getElementById('notif-message')?.value.trim();
  if (!title || !message) { showToast('Fill all fields', 'error'); return; }
  showLoader();
  await supabase.from('notifications').insert({ title, message, is_enabled: true });
  hideLoader();
  showToast('Notification added!', 'success');
  addForm.style.display = 'none';
  loadNotifications();
});

window.toggleNotif = async (id, enabled) => { await supabase.from('notifications').update({ is_enabled: enabled }).eq('id', id); };
window.deleteNotif = async (id) => {
  if (!confirm('Delete notification?')) return;
  await supabase.from('notifications').delete().eq('id', id);
  loadNotifications();
};

loadNotifications();
