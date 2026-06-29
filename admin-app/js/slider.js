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
                const path = `sliders/${Date.now()}_${file.name}`;
                const image_url = await storageApi.uploadFile('showpay_assets', path, file);

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
    const sliders = await dbApi.select('slider_images', null, { column: 'display_order', ascending: true });
    const tbody = document.getElementById('sliders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    sliders.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${s.image_url}" style="height: 40px; width: 80px; object-fit: cover; border-radius: 6px;"></td>
            <td><strong>${s.title}</strong></td>
            <td><a href="${s.link_url || '#'}" target="_blank">${s.link_url || 'N/A'}</a></td>
            <td>${s.display_order}</td>
            <td><span class="status-badge status-${s.is_enabled ? 'completed' : 'pending'}">${s.is_enabled ? 'Active' : 'Disabled'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm btn-toggle-slider" data-id="${s.id}">${s.is_enabled ? 'Disable' : 'Enable'}</button>
                    <button class="btn btn-danger btn-sm btn-del-slider" data-id="${s.id}">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-slider').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const s = sliders.find(x => x.id === id);
        await dbApi.update('slider_images', { is_enabled: !s.is_enabled }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Toggled slider ${s.title}`, performed_by: 'Admin' });
        sharedUtils.showToast("Slider status updated!", "success");
        loadSliders();
    }));

    document.querySelectorAll('.btn-del-slider').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        await dbApi.delete('slider_images', { id });
        sharedUtils.showToast("Slider deleted!", "success");
        loadSliders();
    }));
}
