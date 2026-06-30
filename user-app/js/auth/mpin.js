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
                sharedAuth.logout();
                window.location.href = 'login.html';
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
                submitBtn.innerText = "Saving...";
            }

            try {
                // Update user record with MPIN and status 'completed' in Supabase
                await dbApi.update('users', { mpin: mpin, status: 'completed' }, { id: currentUser.id });
                currentUser.mpin = mpin;
                currentUser.status = 'completed';
                sharedAuth.setCurrentUser(currentUser);

                // Show native success message
                sharedUtils.showToast("Your account updated successfully. Please wait some time.", "success");

                // Close MPIN modal and trigger next video modal in flow after 2 seconds
                const mpinModal = document.getElementById('mpin-modal');
                if (mpinModal) mpinModal.classList.remove('active');

                // Wait 2 seconds, then show video modal
                setTimeout(() => {
                    const videoModal = document.getElementById('video-modal');
                    if (videoModal) {
                        videoModal.classList.add('active');
                        const player = document.getElementById('popup-video-player');
                        if (player) {
                            player.play().catch(e => console.log('Auto-play prevented'));
                        }
                    }
                }, 2000);

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
