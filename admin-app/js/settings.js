import { dbApi } from '../../shared/js/supabase.js';
import { sharedUtils } from '../../shared/js/utils.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const settings = await dbApi.select('settings');
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });

    if (map.mpin_delay_seconds) document.getElementById('setting-mpin-delay').value = map.mpin_delay_seconds;
    if (map.usdt_inr_ratio) document.getElementById('setting-usdt-ratio').value = map.usdt_inr_ratio;
    if (map.auto_logout_minutes) document.getElementById('setting-auto-logout').value = map.auto_logout_minutes;

    document.getElementById('admin-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const delay = document.getElementById('setting-mpin-delay').value;
        const ratio = document.getElementById('setting-usdt-ratio').value;
        const logout = document.getElementById('setting-auto-logout').value;

        await dbApi.update('settings', { value: delay }, { key: 'mpin_delay_seconds' });
        await dbApi.update('settings', { value: ratio }, { key: 'usdt_inr_ratio' });
        await dbApi.update('settings', { value: logout }, { key: 'auto_logout_minutes' });

        await dbApi.insert('activity_logs', { action_type: 'Slider Update', description: `Updated global realtime settings`, performed_by: 'Admin' });
        sharedUtils.showToast("Settings saved and broadcasted successfully!", "success");
    });
});
