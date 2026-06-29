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
            <td><video src="${v.video_url}" style="height: 70px; width: 140px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" controls></video></td>
            <td><strong>${v.title}</strong></td>
            <td><span class="status-badge status-${v.autoplay ? 'completed' : 'pending'}">${v.autoplay ? 'ON' : 'OFF'}</span></td>
            <td><span class="status-badge status-${v.is_enabled ? 'completed' : 'pending'}">${v.is_enabled ? 'ENABLED' : 'DISABLED'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-${v.is_enabled ? 'warning' : 'success'} btn-sm btn-toggle-video" data-id="${v.id}" data-state="${v.is_enabled}">${v.is_enabled ? '🚫 Disable' : '✅ Enable'}</button>
                    <button class="btn btn-secondary btn-sm btn-autoplay-video" data-id="${v.id}" data-auto="${v.autoplay}">⏯️ Autoplay</button>
                    <button class="btn btn-primary btn-sm btn-replace-video" data-id="${v.id}">🔄 Replace URL</button>
                    <button class="btn btn-danger btn-sm btn-delete-video" data-id="${v.id}">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-toggle-video').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentState = e.target.getAttribute('data-state') === 'true';
        await dbApi.update('popup_video', { is_enabled: !currentState }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Toggled video state`, performed_by: 'Admin' });
        sharedUtils.showToast(`Video Popup ${!currentState ? 'Enabled' : 'Disabled'} live!`, "success");
        loadVideos();
    }));

    document.querySelectorAll('.btn-autoplay-video').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const currentAuto = e.target.getAttribute('data-auto') === 'true';
        await dbApi.update('popup_video', { autoplay: !currentAuto }, { id });
        await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Toggled autoplay state`, performed_by: 'Admin' });
        sharedUtils.showToast(`Autoplay ${!currentAuto ? 'ON' : 'OFF'} live!`, "success");
        loadVideos();
    }));

    document.querySelectorAll('.btn-replace-video').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newUrl = prompt("Enter New Video URL:", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
        if (newUrl) {
            await dbApi.update('popup_video', { video_url: newUrl }, { id });
            await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Replaced video URL`, performed_by: 'Admin' });
            sharedUtils.showToast("Video URL replaced live!", "success");
            loadVideos();
        }
    }));

    document.querySelectorAll('.btn-delete-video').forEach(btn => btn.addEventListener('click', async (e) => {
        if (confirm("Delete this video?")) {
            const id = e.target.getAttribute('data-id');
            await dbApi.delete('popup_video', { id });
            await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Deleted video`, performed_by: 'Admin' });
            sharedUtils.showToast("Video deleted live!", "success");
            loadVideos();
        }
    }));
}
