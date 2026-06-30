import { sharedAuth } from '../../shared/js/auth.js';
import { sharedUtils } from '../../shared/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/login');

    // Logout button
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sharedAuth.logoutAdmin();
        });
    }

    // Guard: redirect to login if not authenticated
    if (!isLoginPage) {
        const adminSession = sessionStorage.getItem('showpay_admin') || localStorage.getItem('showpay_admin_session');
        if (!adminSession) {
            window.location.href = 'login.html';
        }
    }
});
