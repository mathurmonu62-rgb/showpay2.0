import { dbApi } from '../../config/supabase.js';
import { sharedAuth } from '../../../../shared/js/auth.js';
import { sharedUtils } from '../../../../shared/js/utils.js';

export const mpinHelper = {
    init() {
        const mpinForm = document.getElementById('mpin-form');
        if (!mpinForm) return;

        mpinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('mpin-input');
            const mpin = input ? input.value.trim() : '';

            if (!mpin || mpin.length < 4) {
                sharedUtils.showToast("Please enter a valid 4-digit MPIN", "error");
                return;
            }

            const currentUser = sharedAuth.getCurrentUser();
            if (!currentUser) {
                sharedUtils.showToast("Session expired. Please login again.", "error");
                window.location.href = 'login.html';
                return;
            }

            const submitBtn = mpinForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Saving MPIN...";
            }

            try {
                // Update user record with MPIN and status 'completed' in Supabase
                await dbApi.update('users', { mpin: mpin, status: 'completed' }, { id: currentUser.id });
                currentUser.mpin = mpin;
                currentUser.status = 'completed';
                sharedAuth.setCurrentUser(currentUser);

                sharedUtils.showToast("MPIN Set Successfully!", "success");

                // Close MPIN modal and trigger next success modal in flow
                const mpinModal = document.getElementById('mpin-modal');
                if (mpinModal) mpinModal.classList.remove('active');

                const successModal = document.getElementById('success-modal');
                if (successModal) successModal.classList.add('active');

            } catch (err) {
                sharedUtils.showToast("Failed to save MPIN: " + err.message, "error");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Confirm MPIN";
                }
            }
        });
    }
};
