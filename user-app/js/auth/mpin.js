import { dbApi } from '../config/supabase.js';
import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';


export const mpinHelper = {
    init() {
        const mpinForm = document.getElementById('mpin-form');
        const mpinBoxes = document.querySelectorAll('.mpin-box');
        const btnCancel = document.getElementById('btn-mpin-cancel');

        if (!mpinForm || !mpinBoxes.length) return;

        // Focus first box when modal becomes visible
        const observer = new MutationObserver(() => {
            const modal = document.getElementById('mpin-modal');
            if (modal && modal.classList.contains('active')) {
                setTimeout(() => {
                    mpinBoxes[0].focus();
                }, 100);
            }
        });
        const mpinModal = document.getElementById('mpin-modal');
        if (mpinModal) {
            observer.observe(mpinModal, { attributes: true, attributeFilter: ['class'] });
        }

        // Auto-focus next box on digit entry
        mpinBoxes.forEach((box, index) => {
            // Only allow digits
            box.addEventListener('keypress', (e) => {
                if (!/\d/.test(e.key)) e.preventDefault();
            });

            box.addEventListener('input', (e) => {
                // Only keep the last digit typed
                const val = e.target.value.replace(/\D/g, '');
                e.target.value = val.slice(-1);

                if (e.target.value) {
                    e.target.classList.add('filled');
                    if (index < mpinBoxes.length - 1) {
                        // Move to next box
                        mpinBoxes[index + 1].focus();
                    } else {
                        // 6th digit filled — auto submit
                        setTimeout(() => {
                            mpinForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                        }, 80);
                    }
                } else {
                    e.target.classList.remove('filled');
                }
            });

            // Backspace: clear current then move to previous
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (e.target.value === '' && index > 0) {
                        mpinBoxes[index - 1].value = '';
                        mpinBoxes[index - 1].classList.remove('filled');
                        mpinBoxes[index - 1].focus();
                    } else {
                        e.target.value = '';
                        e.target.classList.remove('filled');
                    }
                    e.preventDefault();
                }
            });

            // Prevent paste of non-digits; handle paste to fill boxes
            box.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
                pasted.split('').forEach((digit, i) => {
                    if (index + i < mpinBoxes.length) {
                        mpinBoxes[index + i].value = digit;
                        mpinBoxes[index + i].classList.add('filled');
                    }
                });
                // Move focus to last filled or next empty
                const nextEmpty = [...mpinBoxes].findIndex(b => !b.value);
                if (nextEmpty !== -1) mpinBoxes[nextEmpty].focus();
                else mpinBoxes[mpinBoxes.length - 1].focus();

                // Check if all filled
                const all = [...mpinBoxes].every(b => b.value);
                if (all) {
                    setTimeout(() => {
                        mpinForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }, 100);
                }
            });
        });

        // Cancel → logout immediately
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                sharedAuth.logoutUser();
            });
        }

        // Form submit (triggered manually or by button)
        mpinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let mpin = '';
            mpinBoxes.forEach(box => mpin += box.value);

            if (mpin.length < 6) {
                sharedUtils.showToast("Please enter all 6 digits", "error");
                return;
            }

            const confirmBtn = document.getElementById('btn-mpin-confirm');
            if (confirmBtn) confirmBtn.disabled = true;

            const currentUser = sharedAuth.getCurrentUser();
            if (!currentUser) {
                sharedUtils.showToast("Session expired. Please login again.", "error");
                sharedAuth.logoutUser();
                return;
            }

            try {
                // Save MPIN + status completed to DB
                await dbApi.update('users', {
                    mpin: mpin,
                    status: 'completed'
                }, { id: currentUser.id });

                currentUser.mpin = mpin;
                currentUser.status = 'completed';
                sharedAuth.setCurrentUser(currentUser);

                // Hide MPIN modal
                const mpinModal = document.getElementById('mpin-modal');
                if (mpinModal) mpinModal.classList.remove('active');

                // Show success message popup for 2 seconds, then trigger video
                const successModal = document.getElementById('success-modal');
                if (successModal) successModal.classList.add('active');

                setTimeout(() => {
                    if (successModal) successModal.classList.remove('active');
                    // Trigger video popup via custom event handled in home.js
                    document.dispatchEvent(new CustomEvent('mpin_complete'));
                }, 2000);

            } catch (err) {
                sharedUtils.showToast("Failed to save MPIN: " + err.message, "error");
                if (confirmBtn) confirmBtn.disabled = false;
            }
        });
    }
};
