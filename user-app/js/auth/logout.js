import { sharedAuth } from '../../../shared/js/auth.js';
import { constants } from '../config/constants.js';

export class AutoLogout {
    static init(customMinutes = constants.AUTO_LOGOUT_MINUTES) {
        let timer;
        const resetTimer = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                sharedAuth.logoutUser();
            }, customMinutes * 60 * 1000);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('touchstart', resetTimer);
        resetTimer();
    }

    static logoutNow() {
        sharedAuth.logoutUser();
    }
}
