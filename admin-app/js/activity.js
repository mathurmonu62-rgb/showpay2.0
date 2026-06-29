import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const logs = await dbApi.select('activity_logs', null, { column: 'created_at', ascending: false });
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    logs.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="status-badge status-completed">${l.action_type}</span></td>
            <td>${l.description}</td>
            <td><strong>${l.performed_by}</strong></td>
            <td>${sharedUtils.formatDate(l.created_at)} ${sharedUtils.formatTime(l.created_at)}</td>
        `;
        tbody.appendChild(tr);
    });
});
