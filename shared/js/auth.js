import { dbApi } from './supabase.js';

export const sharedAuth = {

    getCurrentUser() {
        const session = localStorage.getItem('showpay_user_session');
        return session ? JSON.parse(session) : null;
    },

    setCurrentUser(user) {
        localStorage.setItem('showpay_user_session', JSON.stringify(user));
    },

    getCurrentAdmin() {
        const session = sessionStorage.getItem('showpay_admin') || localStorage.getItem('showpay_admin_session');
        return session ? JSON.parse(session) : null;
    },

    setCurrentAdmin(admin) {
        sessionStorage.setItem('showpay_admin', JSON.stringify(admin));
        localStorage.setItem('showpay_admin_session', JSON.stringify(admin));
    },

    logoutUser() {
        localStorage.removeItem('showpay_user_session');
        // Navigate to login — handle both relative and root paths
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = '/user-app/pages/login.html';
        }
    },

    logoutAdmin() {
        sessionStorage.removeItem('showpay_admin');
        localStorage.removeItem('showpay_admin_session');
        window.location.href = 'login.html';
    }
};
