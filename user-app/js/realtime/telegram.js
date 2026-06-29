import { userDbApi } from '../config/supabase.js';

export const realtimeTelegram = {
    subscribe(onUpdate) {
        return userDbApi.subscribeToChanges('telegram_popup', onUpdate);
    }
};
