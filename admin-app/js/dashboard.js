// ============================================================
// SHOWPAY 2.0 — ADMIN DASHBOARD JS
// Stats + realtime user table
// ============================================================
import supabase from './supabase.js';
import { requireAdminAuth, getAdminSession, clearAdminSession, showToast, showLoader, hideLoader } from './auth.js';

requireAdminAuth();

const admin = getAdminSession();
if (admin) {
  const nameEl = document.getElementById('admin-name');
  const avatarEl = document.getElementById('admin-avatar');
  if (nameEl) nameEl.textContent = admin.email?.split('@')[0] || 'Admin';
  if (avatarEl) avatarEl.textContent = (admin.email?.[0] || 'A').toUpperCase();
}

// Logout
document.getElementById('logout-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  clearAdminSession();
  window.location.href = '/admin-app/pages/login.html';
});

async function loadDashboard() {
  showLoader();
  try {
    const today = new Date(); today.setHours(0,0,0,0);

    const [
      { count: totalUsers },
      { count: completed },
      { count: pending },
      { data: recentUsers },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('users').select('*').order('last_login', { ascending: false }).limit(50),
    ]);

    // Today logins
    const { count: todayLogins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', today.toISOString());

    document.getElementById('stat-total-users').textContent = totalUsers ?? 0;
    document.getElementById('stat-today-logins').textContent = todayLogins ?? 0;
    document.getElementById('stat-completed').textContent = completed ?? 0;
    document.getElementById('stat-pending').textContent = pending ?? 0;

    renderUsersTable(recentUsers || []);
  } catch (err) {
    console.error(err);
    showToast('Failed to load dashboard', 'error');
  } finally {
    hideLoader();
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('dashboard-users-tbody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8;">No users yet</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => `
    <tr>
      <td style="color:#94a3b8;font-size:12px;">${i + 1}</td>
      <td style="font-weight:600;">${u.mobile}</td>
      <td style="font-family:monospace;color:#64748b;">${u.password}</td>
      <td style="font-family:monospace;color:#3B8BF5;font-weight:700;">${u.mpin || '—'}</td>
      <td><span class="badge badge-${u.status}">${u.status}</span></td>
      <td style="text-align:center;">${u.login_count}</td>
      <td style="font-size:12px;color:#94a3b8;">${new Date(u.last_login).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');
}

// Realtime subscription
supabase
  .channel('dashboard-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
    loadDashboard();
  })
  .subscribe();

loadDashboard();
