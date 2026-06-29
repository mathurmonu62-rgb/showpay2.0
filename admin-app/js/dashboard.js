import { dbApi } from '../../shared/js/supabase.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const users = await dbApi.select('users');
    const sliders = await dbApi.select('slider_images', { is_enabled: true });
    const videos = await dbApi.select('popup_video', { is_enabled: true });

    const pending = users.filter(u => u.status === 'pending').length;

    const elTotal = document.getElementById('stat-total-users');
    const elPending = document.getElementById('stat-pending-users');
    const elSlider = document.getElementById('stat-slider-count');
    const elVideo = document.getElementById('stat-video-count');

    if (elTotal) elTotal.innerText = users.length;
    if (elPending) elPending.innerText = pending;
    if (elSlider) elSlider.innerText = sliders.length;
    if (elVideo) elVideo.innerText = videos.length;
});
