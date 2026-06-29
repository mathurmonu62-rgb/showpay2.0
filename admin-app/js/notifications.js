import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadNotifications();

    document.getElementById('btn-create-notif').addEventListener('click', async () => {
        const title = prompt("Enter Notification Title:", "System Upgrade Alert");
        const message = prompt("Enter Message:", "Realtime broadcasts are active across ShowPay.");
        if (title && message) {
            await dbApi.insert('notifications', { title, message, is_enabled: true });
            sharedUtils.showToast("Notification broadcasted successfully!", "success");
            loadNotifications();
        }
    });
});

async function loadNotifications() {
    const notifs = await dbApi.select('notifications');
    const tbody = document.getElementById('notifications-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    notifs.forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${n.title}</strong></td>
            <td>${n.message}</td>
            <td>${sharedUtils.formatDate(n.created_at)}</td>
            <td><span class="status-badge status-${n.is_enabled ? 'completed' : 'pending'}">${n.is_enabled ? 'Active' : 'Muted'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm btn-toggle-notif" data-id="${n.id}">${n.is_enabled ? 'Mute' : 'Activate'}</button>
                    <button class="btn btn-danger btn-sm btn-del-notif" data-id="${n.id}">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-notif').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const n = notifs.find(x => x.id === id);
        await dbApi.update('notifications', { is_enabled: !n.is_enabled }, { id });
        sharedUtils.showToast("Notification status updated!", "success");
        loadNotifications();
    }));

    document.querySelectorAll('.btn-del-notif').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        await dbApi.delete('notifications', { id });
        sharedUtils.showToast("Notification deleted!", "success");
        loadNotifications();
    }));
}
