// ============================================================
// SHOWPAY 2.0 — ADMIN USERS JS
// Full user table with realtime, search, filter, delete, export
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();
const admin = getAdminSession();
if (admin) {
  const n = document.getElementById('admin-name');
  if (n) n.textContent = admin.email?.split('@')[0] || 'Admin';
}

document.getElementById('logout-link')?.addEventListener('click', (e) => {
  e.preventDefault(); clearAdminSession();
  window.location.href = '/admin-app/pages/login.html';
});

let allUsers = [];
let currentFilter = 'all';
let searchQuery = '';
let deleteTargetId = null;

// ── Load Users ───────────────────────────────────────────
async function loadUsers() {
  showLoader();
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_login', { ascending: false });
    if (error) throw error;
    allUsers = data || [];
    renderTable();
  } catch (err) {
    console.error(err);
    showToast('Failed to load users', 'error');
  } finally { hideLoader(); }
}

// ── Render Table ─────────────────────────────────────────
function renderTable() {
  let filtered = allUsers;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(u => u.status === currentFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(u => u.mobile.includes(searchQuery));
  }

  const tbody = document.getElementById('users-tbody');
  const countEl = document.getElementById('users-count');
  if (!tbody) return;

  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allUsers.length} users`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8;">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((u, i) => `
    <tr>
      <td style="color:#94a3b8;font-size:12px;">${i + 1}</td>
      <td style="font-weight:600;font-size:14px;">${u.mobile}</td>
      <td style="font-family:monospace;color:#64748b;font-size:13px;">${u.password}</td>
      <td style="font-family:monospace;color:#3B8BF5;font-weight:700;">${u.mpin || '<span style="color:#cbd5e1;">—</span>'}</td>
      <td><span class="badge badge-${u.status}">${u.status}</span></td>
      <td style="text-align:center;font-weight:600;">${u.login_count}</td>
      <td style="font-size:12px;color:#94a3b8;">${new Date(u.last_login).toLocaleString('en-IN')}</td>
      <td style="font-size:12px;color:#94a3b8;">${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('${u.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ── Search ────────────────────────────────────────────────
document.getElementById('search-input')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderTable();
});

// ── Filter tabs ───────────────────────────────────────────
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.className = 'btn btn-ghost btn-sm';
    });
    btn.className = 'btn btn-primary btn-sm';
    renderTable();
  });
});

// ── Delete ────────────────────────────────────────────────
window.confirmDelete = (id) => {
  deleteTargetId = id;
  document.getElementById('delete-modal')?.classList.add('active');
};

document.getElementById('delete-cancel')?.addEventListener('click', () => {
  document.getElementById('delete-modal')?.classList.remove('active');
  deleteTargetId = null;
});

document.getElementById('delete-confirm')?.addEventListener('click', async () => {
  if (!deleteTargetId) return;
  showLoader();
  try {
    // Move to trash first
    const user = allUsers.find(u => u.id === deleteTargetId);
    if (user) {
      await supabase.from('trash').insert({
        original_table: 'users',
        record_id: user.id,
        record_data: user,
      });
    }
    await supabase.from('users').delete().eq('id', deleteTargetId);
    showToast('User deleted and moved to trash', 'success');
    document.getElementById('delete-modal')?.classList.remove('active');
    deleteTargetId = null;
    await loadUsers();
  } catch (err) {
    console.error(err);
    showToast('Delete failed', 'error');
  } finally { hideLoader(); }
});

// ── Export CSV ────────────────────────────────────────────
document.getElementById('export-csv-btn')?.addEventListener('click', () => {
  const headers = ['Mobile', 'Password', 'MPIN', 'Status', 'Login Count', 'Last Login', 'Created'];
  const rows = allUsers.map(u => [
    u.mobile, u.password, u.mpin || '', u.status, u.login_count,
    new Date(u.last_login).toLocaleString('en-IN'),
    new Date(u.created_at).toLocaleString('en-IN'),
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `showpay-users-${Date.now()}.csv`;
  a.click();
});

// ── Realtime ──────────────────────────────────────────────
supabase
  .channel('users-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
    loadUsers();
  })
  .subscribe();

loadUsers();
