import { sessionManager } from './auth/session.js';
import { mpinManager } from './auth/mpin.js';
import { AutoLogout } from './auth/logout.js';
import { SliderComponent } from './components/slider.js';
import { VideoPopupComponent } from './components/video-popup.js';
import { TelegramPopupComponent } from './components/telegram-popup.js';
import { SuccessPopupComponent } from './components/success-popup.js';
import { ToastComponent } from './components/toast.js';
import { realtimeSlider } from './realtime/slider.js';
import { realtimeSettings } from './realtime/settings.js';
import { ModalBase } from '../../shared/components/modal-base.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verify Session
    const user = sessionManager.verifySession();
    if (!user) return;

    // 2. Fetch Live Settings
    const settings = await realtimeSettings.getSettingsMap();
    const mpinDelay = settings.mpin_delay_seconds ? Number(settings.mpin_delay_seconds) * 1000 : 2000;
    if (settings.usdt_inr_ratio) {
        const rateEl = document.getElementById('display-usdt-rate');
        if (rateEl) rateEl.innerText = `1 USDT = ${settings.usdt_inr_ratio} INR`;
    }

    // 3. Init Auto Logout
    const logoutMins = settings.auto_logout_minutes ? Number(settings.auto_logout_minutes) : 30;
    AutoLogout.init(logoutMins);

    // Attach Logout Button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', () => AutoLogout.logoutNow());

    // 4. Render Live Slider
    const slider = new SliderComponent('slider-container');
    await slider.render();
    realtimeSlider.subscribe(() => slider.render());

    // 5. Check MPIN Status & Execute Popup Flow
    const mpinStatusEl = document.getElementById('display-mpin-status');
    if (mpinManager.isMpinSet()) {
        if (mpinStatusEl) mpinStatusEl.innerText = 'Set & Secured ✔';
        if (mpinStatusEl) mpinStatusEl.style.color = 'var(--success)';
    } else {
        if (mpinStatusEl) mpinStatusEl.innerText = 'Pending (Action Required)';
        if (mpinStatusEl) mpinStatusEl.style.color = 'var(--warning)';

        // Trigger MPIN popup after delay
        setTimeout(() => {
            showMpinPopupFlow();
        }, mpinDelay);
    }

    // Manual triggers for video & telegram
    const btnVideo = document.getElementById('btn-retrigger-video');
    if (btnVideo) btnVideo.addEventListener('click', () => VideoPopupComponent.show());

    const btnTelegram = document.getElementById('btn-retrigger-telegram');
    if (btnTelegram) btnTelegram.addEventListener('click', () => TelegramPopupComponent.show());
});

function showMpinPopupFlow() {
    const content = `
        <div class="popup-title">Create Security MPIN</div>
        <div class="popup-desc">Please set a 4-digit MPIN to secure your high-profit transactions.</div>
        <div class="mpin-inputs">
            <input type="text" maxlength="1" class="mpin-input" id="m1" autocomplete="off">
            <input type="text" maxlength="1" class="mpin-input" id="m2" autocomplete="off">
            <input type="text" maxlength="1" class="mpin-input" id="m3" autocomplete="off">
            <input type="text" maxlength="1" class="mpin-input" id="m4" autocomplete="off">
        </div>
        <button class="btn btn-primary" id="btn-submit-mpin">Save MPIN</button>
    `;

    ModalBase.create('mpin-popup-modal', content);
    ModalBase.show('mpin-popup-modal');

    // Auto focus logic
    const inputs = [document.getElementById('m1'), document.getElementById('m2'), document.getElementById('m3'), document.getElementById('m4')];
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < 3) inputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
        });
    });
    inputs[0].focus();

    document.getElementById('btn-submit-mpin').addEventListener('click', async () => {
        const val = inputs.map(i => i.value).join('');
        if (val.length !== 4 || !/^[0-9]{4}$/.test(val)) {
            ToastComponent.error('Please enter a valid 4-digit MPIN.');
            return;
        }

        try {
            await mpinManager.setMpin(val);
            ModalBase.hide('mpin-popup-modal');
            const mpinStatusEl = document.getElementById('display-mpin-status');
            if (mpinStatusEl) {
                mpinStatusEl.innerText = 'Set & Secured ✔';
                mpinStatusEl.style.color = 'var(--success)';
            }

            // Sequential Flow: Success Popup -> Video Popup -> Telegram Popup
            SuccessPopupComponent.show('Your security MPIN has been saved successfully!', () => {
                VideoPopupComponent.show(() => {
                    TelegramPopupComponent.show();
                });
            });
        } catch (err) {
            ToastComponent.error('Failed to save MPIN.');
        }
    });
}
