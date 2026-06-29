import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mobile = document.getElementById('login-mobile').value.trim();
            const password = document.getElementById('login-password').value.trim();

            const submitBtn = document.getElementById('login-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Verifying...';

            try {
                const res = await sharedAuth.loginUser(mobile, password);
                if (res.success) {
                    sharedUtils.showToast('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 500);
                } else {
                    sharedUtils.showToast(res.error, 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Login';
                }
            } catch (err) {
                sharedUtils.showToast('An error occurred during verification.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Login';
            }
        });
    }
});
