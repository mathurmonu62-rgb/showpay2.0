import { userDbApi } from '../config/supabase.js';

export const realtimeSlider = {
    subscribe(onUpdate) {
        return userDbApi.subscribeToChanges('slider_images', onUpdate);
    }
};
