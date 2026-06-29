import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadTelegram();

    document.getElementById('btn-update-telegram').addEventListener('click', async () => {
        const link = prompt("Enter New Telegram Channel Link:", "https://t.me/showpay_official");
        if (link) {
            const items = await dbApi.select('telegram_popup');
            if (items.length > 0) {
                await dbApi.update('telegram_popup', { telegram_link: link }, { id: items[0].id });
                await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Updated telegram link`, performed_by: 'Admin' });
                sharedUtils.showToast("Telegram link updated and broadcasted!", "success");
                loadTelegram();
            }
        }
    });
});

async function loadTelegram() {
    const items = await dbApi.select('telegram_popup');
    const tbody = document.getElementById('telegram-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    items.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${t.title}</strong></td>
            <td>${t.description}</td>
            <td><a href="${t.telegram_link}" target="_blank">Telegram Link</a></td>
            <td><span class="status-badge status-${t.is_enabled ? 'completed' : 'pending'}">${t.is_enabled ? 'Active' : 'Disabled'}</span></td>
            <td><button class="btn btn-secondary btn-sm btn-toggle-telegram" data-id="${t.id}">${t.is_enabled ? 'Disable' : 'Enable'}</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-telegram').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const t = items.find(x => x.id === id);
        await dbApi.update('telegram_popup', { is_enabled: !t.is_enabled }, { id });
        sharedUtils.showToast("Telegram popup status updated!", "success");
        loadTelegram();
    }));
}
