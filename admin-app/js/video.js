import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadVideos();

    document.getElementById('btn-update-video').addEventListener('click', async () => {
        const url = prompt("Enter New Video URL:", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
        if (url) {
            const videos = await dbApi.select('popup_video');
            if (videos.length > 0) {
                await dbApi.update('popup_video', { video_url: url }, { id: videos[0].id });
                await dbApi.insert('activity_logs', { action_type: 'Video Update', description: `Updated popup video URL`, performed_by: 'Admin' });
                sharedUtils.showToast("Video URL updated and broadcasted!", "success");
                loadVideos();
            }
        }
    });
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
