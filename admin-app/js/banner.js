import { dbApi, storageApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadBanners();

    const fileInput = document.getElementById('banner-file-input');
    const btnAdd = document.getElementById('btn-add-banner');

    if (btnAdd && fileInput) {
        btnAdd.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const title = prompt("Enter Banner Title:", "Exclusive Cashback Offer");
            if (!title) return;

            btnAdd.disabled = true;
            btnAdd.innerText = "Uploading Banner...";

            try {
                const path = `banners/${Date.now()}_${file.name}`;
                const image_url = await storageApi.uploadFile('showpay_assets', path, file);

                await dbApi.insert('banner_images', { title, image_url, link_url: '#', is_enabled: true });
                await dbApi.insert('activity_logs', { action_type: 'Banner Update', description: `Uploaded banner ${title}`, performed_by: 'Admin' });
                sharedUtils.showToast("Banner uploaded from gallery and broadcasted live!", "success");
                loadBanners();
            } catch (err) {
                sharedUtils.showToast("Upload failed: " + err.message, "error");
            } finally {
                btnAdd.disabled = false;
                btnAdd.innerText = "➕ Upload Banner from Gallery";
                fileInput.value = '';
            }
        });
    }
});

async function loadBanners() {
    const banners = await dbApi.select('banner_images');
    const tbody = document.getElementById('banners-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    banners.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${b.image_url}" alt="Preview" style="height: 60px; width: 140px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);"></td>
            <td><strong>${b.title}</strong></td>
            <td><a href="${b.link_url || '#'}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">${b.link_url || '#'}</a></td>
            <td><span class="status-badge status-${b.is_enabled ? 'completed' : 'pending'}">${b.is_enabled ? 'ENABLED' : 'DISABLED'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-${b.is_enabled ? 'warning' : 'success'} btn-sm btn-toggle-banner" data-id="${b.id}" data-state="${b.is_enabled}">${b.is_enabled ? '🚫 Disable' : '✅ Enable'}</button>
                    <button class="btn btn-primary btn-sm btn-replace-banner" data-id="${b.id}">🔄 Replace</button>
                    <button class="btn btn-danger btn-sm btn-delete-banner" data-id="${b.id}">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-banner').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentState = e.target.getAttribute('data-state') === 'true';
        await dbApi.update('banner_images', { is_enabled: !currentState }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Banner Update', description: `Toggled banner state`, performed_by: 'Admin' });
        sharedUtils.showToast(`Banner ${!currentState ? 'Enabled' : 'Disabled'} live!`, "success");
        loadBanners();
    }));

    document.querySelectorAll('.btn-replace-banner').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newUrl = prompt("Enter New Banner Image URL:", "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=1000&auto=format&fit=crop");
        if (newUrl) {
            await dbApi.update('banner_images', { image_url: newUrl }, { id });
            await dbApi.insert('activity_logs', { action_type: 'Banner Update', description: `Replaced banner URL`, performed_by: 'Admin' });
            sharedUtils.showToast("Banner replaced live!", "success");
            loadBanners();
        }
    }));

    document.querySelectorAll('.btn-delete-banner').forEach(btn => btn.addEventListener('click', async (e) => {
        if (confirm("Delete this banner?")) {
            const id = e.target.getAttribute('data-id');
            await dbApi.delete('banner_images', { id });
            await dbApi.insert('activity_logs', { action_type: 'Banner Update', description: `Deleted banner`, performed_by: 'Admin' });
            sharedUtils.showToast("Banner deleted live!", "success");
            loadBanners();
        }
    }));
}
