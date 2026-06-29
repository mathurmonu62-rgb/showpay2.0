import { userDbApi } from '../config/supabase.js';

export const realtimeSettings = {
    subscribe(onUpdate) {
        return userDbApi.subscribeToChanges('settings', onUpdate);
    },
    async getSettingsMap() {
        const rows = await userDbApi.select('settings');
        const map = {};
        rows.forEach(r => { map[r.key] = r.value; });
        return map;
    }
};
