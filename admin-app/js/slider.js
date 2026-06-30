import { dbApi, storageApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadSliders();

    const fileInput = document.getElementById('slider-file-input');
    const btnAdd = document.getElementById('btn-add-slider');

    if (btnAdd && fileInput) {
        btnAdd.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const title = prompt("Enter Slider Title:", "New High Profit Promo");
            if (!title) return;

            btnAdd.disabled = true;
            btnAdd.innerText = "Uploading...";

            try {
                const path = `${Date.now()}_${file.name}`;
                const image_url = await storageApi.uploadFile('slider_images', path, file);

                const all = await dbApi.select('slider_images');
                await dbApi.insert('slider_images', { title, image_url, link_url: '#', display_order: all.length + 1, is_enabled: true });
                await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Uploaded slider ${title}`, performed_by: 'Admin' });
                sharedUtils.showToast("Slider uploaded from gallery and broadcasted live!", "success");
                loadSliders();
            } catch (err) {
                sharedUtils.showToast("Upload failed: " + err.message, "error");
            } finally {
                btnAdd.disabled = false;
                btnAdd.innerText = "➕ Upload from Gallery";
                fileInput.value = '';
            }
        });
    }
});

async function loadSliders() {
    let sliders = await dbApi.select('slider_images');
    sliders.sort((a, b) => a.display_order - b.display_order);

    const tbody = document.getElementById('sliders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    sliders.forEach((s, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${s.image_url}" alt="Preview" style="height: 60px; width: 140px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);"></td>
            <td><strong>${s.title}</strong></td>
            <td><strong>${s.display_order}</strong></td>
            <td><span class="status-badge status-${s.is_enabled ? 'completed' : 'pending'}">${s.is_enabled ? 'ENABLED' : 'DISABLED'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-${s.is_enabled ? 'warning' : 'success'} btn-sm btn-toggle-slider" data-id="${s.id}" data-state="${s.is_enabled}">${s.is_enabled ? '🚫 Disable' : '✅ Enable'}</button>
                    <button class="btn btn-secondary btn-sm btn-reorder-slider" data-id="${s.id}" data-order="${s.display_order}">↕️ Reorder</button>
                    <button class="btn btn-danger btn-sm btn-delete-slider" data-id="${s.id}">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-slider').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentState = e.target.getAttribute('data-state') === 'true';
        await dbApi.update('slider_images', { is_enabled: !currentState }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Toggled slider state`, performed_by: 'Admin' });
        sharedUtils.showToast(`Slider ${!currentState ? 'Enabled' : 'Disabled'} live!`, "success");
        loadSliders();
    }));

    document.querySelectorAll('.btn-reorder-slider').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentOrder = e.target.getAttribute('data-order');
        const newOrder = prompt("Enter New Display Order (Number):", currentOrder);
        if (newOrder && !isNaN(newOrder)) {
            await dbApi.update('slider_images', { display_order: parseInt(newOrder) }, { id });
            await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Reordered slider`, performed_by: 'Admin' });
            sharedUtils.showToast("Slider reordered live!", "success");
            loadSliders();
        }
    }));

    document.querySelectorAll('.btn-delete-slider').forEach(btn => btn.addEventListener('click', async (e) => {
        if (confirm("Delete this slider?")) {
            const id = e.target.getAttribute('data-id');
            await dbApi.delete('slider_images', { id });
            await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Deleted slider`, performed_by: 'Admin' });
            sharedUtils.showToast("Slider deleted live!", "success");
            loadSliders();
        }
    }));
}
