import { dbApi, storageApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadVideos();

    const fileInput = document.getElementById('video-file-input');
    const btnUpdate = document.getElementById('btn-update-video');

    if (btnUpdate && fileInput) {
        btnUpdate.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            btnUpdate.disabled = true;
            btnUpdate.innerText = "Uploading Video...";

            try {
                const path = `videos/${Date.now()}_${file.name}`;
                const video_url = await storageApi.uploadFile('showpay_assets', path, file);

                const videos = await dbApi.select('popup_video');
                if (videos.length > 0) {
                    await dbApi.update('popup_video', { video_url: video_url }, { id: videos[0].id });
                } else {
                    await dbApi.insert('popup_video', { title: 'How to use ShowPay Fast', video_url: video_url, autoplay: true, is_enabled: true });
                }
                await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Uploaded popup video from gallery`, performed_by: 'Admin' });
                sharedUtils.showToast("Video uploaded from gallery and broadcasted!", "success");
                loadVideos();
            } catch (err) {
                sharedUtils.showToast("Upload failed: " + err.message, "error");
            } finally {
                btnUpdate.disabled = false;
                btnUpdate.innerText = "📁 Upload Video from Gallery";
                fileInput.value = '';
            }
        });
    }
});

async function loadVideos() {
    const videos = await dbApi.select('popup_video');
    const tbody = document.getElementById('videos-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    videos.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.title}</strong></td>
            <td><a href="${v.video_url}" target="_blank">Preview Video</a></td>
            <td>${v.autoplay ? 'Yes' : 'No'}</td>
            <td><span class="status-badge status-${v.is_enabled ? 'completed' : 'pending'}">${v.is_enabled ? 'Active' : 'Disabled'}</span></td>
            <td><button class="btn btn-secondary btn-sm btn-toggle-video" data-id="${v.id}">${v.is_enabled ? 'Disable' : 'Enable'}</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-video').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const v = videos.find(x => x.id === id);
        await dbApi.update('popup_video', { is_enabled: !v.is_enabled }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Toggled video popup`, performed_by: 'Admin' });
        sharedUtils.showToast("Video popup status updated!", "success");
        loadVideos();
    }));
}
