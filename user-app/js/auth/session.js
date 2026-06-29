import { sharedAuth } from '../../../shared/js/auth.js';

export const sessionManager = {
    getUser() {
        return sharedAuth.getCurrentUser();
    },
    verifySession() {
        const user = this.getUser();
        const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/login');
        if (!user && !isLoginPage) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    },
    updateLocalUser(updates) {
        const user = this.getUser();
        if (user) {
            const updated = { ...user, ...updates };
            localStorage.setItem('showpay_user_session', JSON.stringify(updated));
            return updated;
        }
        return null;
    }
};
