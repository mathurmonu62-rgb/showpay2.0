import { userDbApi } from '../config/supabase.js';
import { sessionManager } from './session.js';

export const mpinManager = {
    isMpinSet() {
        const user = sessionManager.getUser();
        return user && user.mpin && user.mpin.trim() !== '';
    },
    async setMpin(newMpin) {
        const user = sessionManager.getUser();
        if (!user) throw new Error('No active user session');
        
        await userDbApi.update('users', { mpin: newMpin }, { id: user.id });
        sessionManager.updateLocalUser({ mpin: newMpin });
        return true;
    }
};
