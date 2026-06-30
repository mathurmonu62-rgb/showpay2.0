import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch current settings from DB
    const settings = await dbApi.select('settings');
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });

    // 2. Populate form fields safely
    const delayInput = document.getElementById('setting-mpin-delay');
    const sliderToggle = document.getElementById('setting-slider-enabled');
    const bannerToggle = document.getElementById('setting-banner-enabled');
    const videoToggle = document.getElementById('setting-video-enabled');
    const telegramToggle = document.getElementById('setting-telegram-enabled');

    if (delayInput && map.mpin_delay_seconds) delayInput.value = map.mpin_delay_seconds;
    if (sliderToggle && map.slider_enabled) sliderToggle.checked = (map.slider_enabled === 'true');
    if (bannerToggle && map.banner_enabled) bannerToggle.checked = (map.banner_enabled === 'true');
    if (videoToggle && map.video_popup_enabled) videoToggle.checked = (map.video_popup_enabled === 'true');
    if (telegramToggle && map.telegram_popup_enabled) telegramToggle.checked = (map.telegram_popup_enabled === 'true');

    // 3. Handle Submit
    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const delay = delayInput ? delayInput.value.toString() : '2';
                const slider = sliderToggle ? sliderToggle.checked.toString() : 'true';
                const banner = bannerToggle ? bannerToggle.checked.toString() : 'true';
                const video = videoToggle ? videoToggle.checked.toString() : 'true';
                const telegram = telegramToggle ? telegramToggle.checked.toString() : 'true';

                await dbApi.update('settings', { value: delay }, { key: 'mpin_delay_seconds' });
                await dbApi.update('settings', { value: slider }, { key: 'slider_enabled' });
                await dbApi.update('settings', { value: banner }, { key: 'banner_enabled' });
                await dbApi.update('settings', { value: video }, { key: 'video_popup_enabled' });
                await dbApi.update('settings', { value: telegram }, { key: 'telegram_popup_enabled' });

                await dbApi.insert('activity_logs', { action_type: 'System Settings', description: `Updated global system settings (Toggles & Delays)`, performed_by: 'Admin' });
                
                sharedUtils.showToast("Settings saved and broadcasted live successfully!", "success");
            } catch (err) {
                sharedUtils.showToast("Error saving settings: " + err.message, "error");
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
