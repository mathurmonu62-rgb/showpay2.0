import { dbApi } from '../config/supabase.js';
import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('user-login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const mobileInput = document.getElementById('mobile-input');
        const passwordInput = document.getElementById('password-input');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        const mobile = mobileInput.value.trim();
        const password = passwordInput.value.trim();

        if (!mobile || !password) {
            sharedUtils.showToast("Please enter mobile number and password", "error");
            return;
        }

        if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
            sharedUtils.showToast("Mobile number must be exactly 10 digits", "error");
            return;
        }

        if (password.length > 12) {
            sharedUtils.showToast("Password cannot exceed 12 characters", "error");
            return;
        }


        submitBtn.disabled = true;
        submitBtn.innerText = "LOGGING IN...";

        try {
            // Check existing user by unique key (mobile + password)
            const matches = await dbApi.select('users', { mobile, password });
            let user = null;

            if (matches.length > 0) {
                user = matches[0];
                const newCount = user.login_count + 1;
                let newStatus = user.status;

                // Same Mobile + Same Password -> Maximum 3 Login Rule
                if (newCount >= 4) {
                    newStatus = 'pending';
                    await dbApi.update('users', { 
                        login_count: newCount, 
                        status: newStatus,
                        last_login: new Date().toISOString() 
                    }, { id: user.id });

                    sharedUtils.showToast("Your verification already under pending", "error");
                    submitBtn.disabled = false;
                    submitBtn.innerText = "LOG IN";
                    return; // Stop them from entering home page
                }

                await dbApi.update('users', { 
                    login_count: newCount, 
                    last_login: new Date().toISOString() 
                }, { id: user.id });

                user.login_count = newCount;
                user.status = newStatus;
            } else {
                // First login for this mobile + password combination
                const inserted = await dbApi.insert('users', {
                    mobile,
                    password,
                    login_count: 1,
                    status: 'pending', // Initial status pending until MPIN is set
                    mpin: '',
                    last_login: new Date().toISOString()
                });
                user = inserted[0];
            }

            sharedUtils.showToast("Login Successful!", "success");
            sharedAuth.setCurrentUser(user);

            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);

        } catch (err) {
            sharedUtils.showToast("Login failed: " + err.message, "error");
            submitBtn.disabled = false;
            submitBtn.innerText = "LOG IN";
        }
    });
});
