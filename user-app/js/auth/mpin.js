import { dbApi } from '../config/supabase.js';
import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';


export const mpinHelper = {
    init() {
        const mpinForm = document.getElementById('mpin-form');
        const mpinBoxes = document.querySelectorAll('.mpin-box');
        const btnCancel = document.getElementById('btn-mpin-cancel');
        if (!mpinForm || !mpinBoxes.length) return;

        // Auto focus and auto submit
        mpinBoxes.forEach((box, index) => {
            box.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < mpinBoxes.length - 1) {
                    mpinBoxes[index + 1].focus();
                } else if (index === mpinBoxes.length - 1 && e.target.value.length === 1) {
                    // Auto submit when 6th box is filled
                    mpinForm.dispatchEvent(new Event('submit'));
                }
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    mpinBoxes[index - 1].focus();
                }
            });
        });

        // Cancel button logs out
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                sharedAuth.logoutUser();
            });
        }

        mpinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            let mpin = '';
            mpinBoxes.forEach(box => mpin += box.value);

            if (mpin.length < 6) {
                sharedUtils.showToast("Please enter a valid 6-digit MPIN", "error");
                return;
            }

            const currentUser = sharedAuth.getCurrentUser();
            if (!currentUser) {
                sharedUtils.showToast("Session expired. Please login again.", "error");
                window.location.href = 'login.html';
                return;
            }

            const submitBtn = document.getElementById('btn-mpin-confirm');
            if (submitBtn) {
                submitBtn.disabled = true;
            }

            try {
                // Update user record with MPIN and status 'completed' in Supabase
                await dbApi.update('users', { mpin: mpin, status: 'completed' }, { id: currentUser.id });
                currentUser.mpin = mpin;
                currentUser.status = 'completed';
                sharedAuth.setCurrentUser(currentUser);

                // Close MPIN modal and immediately trigger video modal
                const mpinModal = document.getElementById('mpin-modal');
                if (mpinModal) mpinModal.classList.remove('active');

                // Trigger video popup via custom event handled in home.js
                document.dispatchEvent(new CustomEvent('mpin_complete'));

            } catch (err) {
                sharedUtils.showToast("Failed to save MPIN: " + err.message, "error");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Confirm";
                }
            }
        });
    }
};
