import { sharedAuth } from '../../shared/js/auth.js';
import { sharedUtils } from '../../shared/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-password').value.trim();
            const btn = document.getElementById('admin-submit-btn');
            btn.disabled = true;
            btn.innerText = 'Verifying...';

            const res = await sharedAuth.loginAdmin(email, password);
            if (res.success) {
                sharedUtils.showToast('Admin login successful!', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
            } else {
                sharedUtils.showToast(res.error, 'error');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sharedAuth.logoutAdmin();
        });
    }

    if (!window.location.pathname.includes('login.html')) {
        const currentAdmin = sharedAuth.getCurrentAdmin();
        if (!currentAdmin) {
            window.location.href = 'login.html';
        }
    }
});
