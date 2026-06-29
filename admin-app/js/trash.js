import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadTrash();

    document.getElementById('btn-restore-all').addEventListener('click', async () => {
        const trash = await dbApi.select('trash');
        for (const t of trash) {
            if (t.original_table === 'users') {
                await dbApi.update('users', { status: 'completed' }, { id: t.record_id });
            }
            await dbApi.delete('trash', { record_id: t.record_id });
        }
        await dbApi.insert('activity_logs', { action_type: 'Restore History', description: `Restored all items from trash`, performed_by: 'Admin' });
        sharedUtils.showToast("All items restored successfully!", "success");
        loadTrash();
    });

    document.getElementById('btn-empty-trash').addEventListener('click', async () => {
        if (confirm("Empty trash completely?")) {
            const trash = await dbApi.select('trash');
            for (const t of trash) {
                await dbApi.delete('trash', { record_id: t.record_id });
            }
            await dbApi.insert('activity_logs', { action_type: 'Delete History', description: `Emptied trash completely`, performed_by: 'Admin' });
            sharedUtils.showToast("Trash emptied.", "success");
            loadTrash();
        }
    });
});

async function loadTrash() {
    const trash = await dbApi.select('trash');
    const tbody = document.getElementById('trash-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    trash.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="status-badge status-pending">${t.original_table.toUpperCase()}</span></td>
            <td><strong>${t.record_data.mobile ? '+91 ' + t.record_data.mobile : t.record_id}</strong></td>
            <td>${sharedUtils.formatDate(t.deleted_at)} ${sharedUtils.formatTime(t.deleted_at)}</td>
            <td>
                <button class="btn btn-success btn-sm btn-restore-item" data-id="${t.record_id}" data-table="${t.original_table}">🔄 Restore</button>
                <button class="btn btn-danger btn-sm btn-perm-del" data-id="${t.record_id}">❌ Permanent Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-restore-item').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const table = e.target.getAttribute('data-table');
        if (table === 'users') {
            await dbApi.update('users', { status: 'completed' }, { id });
        }
        await dbApi.delete('trash', { record_id: id });
        await dbApi.insert('activity_logs', { action_type: 'Restore History', description: `Restored item ${id}`, performed_by: 'Admin' });
        sharedUtils.showToast("Record restored!", "success");
        loadTrash();
    }));

    document.querySelectorAll('.btn-perm-del').forEach(btn => btn.addEventListener('click', async (e) => {
        if (confirm("Permanently delete?")) {
            const id = e.target.getAttribute('data-id');
            await dbApi.delete('trash', { record_id: id });
            sharedUtils.showToast("Permanently deleted.", "success");
            loadTrash();
        }
    }));
}
