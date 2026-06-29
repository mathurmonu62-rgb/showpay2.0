import { userDbApi } from '../config/supabase.js';

export const realtimeVideo = {
    subscribe(onUpdate) {
        return userDbApi.subscribeToChanges('popup_video', onUpdate);
    }
};
