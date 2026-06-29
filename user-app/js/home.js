import { dbApi } from '../config/supabase.js';
import { sharedAuth } from '../../../shared/js/auth.js';
import { sharedUtils } from '../../../shared/js/utils.js';
import { mpinHelper } from './auth/mpin.js';

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = sharedAuth.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize MPIN helper
    mpinHelper.init();

    // 1. Fetch live data & settings
    await loadHomeData();

    // 2. Setup Realtime subscriptions (Without Refresh)
    dbApi.subscribeToChanges('slider_images', () => loadHomeData());
    dbApi.subscribeToChanges('banner_images', () => loadHomeData());
    dbApi.subscribeToChanges('popup_video', () => loadHomeData());
    dbApi.subscribeToChanges('telegram_popup', () => loadHomeData());
    dbApi.subscribeToChanges('settings', () => loadHomeData());

    // 3. Start Sequential Popups Flow
    startPopupsFlow(currentUser);

    // Setup action listeners
    const btnChat = document.getElementById('btn-floating-chat');
    if (btnChat) btnChat.addEventListener('click', () => sharedUtils.showToast("Connecting to live support...", "success"));

    const btnTopup = document.getElementById('btn-topup-action');
    if (btnTopup) btnTopup.addEventListener('click', () => sharedUtils.showToast("Opening Top up menu...", "success"));
});

async function loadHomeData() {
    const settings = await dbApi.select('settings');
    const getSetting = (k, def) => {
        const found = settings.find(s => s.key === k);
        return found ? found.value : def;
    };

    // Update Ratio Card
    const usdtRatio = getSetting('usdt_inr_ratio', '107.61');
    const bonusRatio = getSetting('bonus_ratio', '4%');
    const elUsdt = document.getElementById('usdt-ratio-text');
    const elBonus = document.getElementById('bonus-ratio-text');
    if (elUsdt) elUsdt.innerText = `1 USDT ≈ ${usdtRatio} INR`;
    if (elBonus) elBonus.innerText = bonusRatio;

    // Load Sliders / Banners
    const sliderEnabled = getSetting('slider_enabled', 'true') === 'true';
    const sliderContainer = document.getElementById('home-slider-container');

    if (sliderEnabled && sliderContainer) {
        sliderContainer.style.display = 'block';
        const sliders = await dbApi.select('slider_images', { is_enabled: true });
        if (sliders.length > 0) {
            sliders.sort((a, b) => a.display_order - b.display_order);
            const active = sliders[0];
            const promoImg = document.getElementById('promo-img');
            if (promoImg) promoImg.src = active.image_url;
        }
    } else if (sliderContainer) {
        sliderContainer.style.display = 'none';
    }
}

async function startPopupsFlow(currentUser) {
    const settings = await dbApi.select('settings');
    const getSetting = (k, def) => {
        const found = settings.find(s => s.key === k);
        return found ? found.value : def;
    };

    const delay = parseInt(getSetting('mpin_delay_seconds', '2')) * 1000;

    // Trigger MPIN Popup if MPIN is blank
    if (!currentUser.mpin || currentUser.mpin === '') {
        setTimeout(() => {
            const mpinModal = document.getElementById('mpin-modal');
            if (mpinModal) mpinModal.classList.add('active');
        }, delay);
    } else {
        // If MPIN already set, jump straight to Video Popup after delay
        setTimeout(() => {
            showVideoPopup();
        }, delay);
    }

    // Success Modal Continue Button -> Shows Video Popup
    const btnSuccess = document.getElementById('btn-success-continue');
    if (btnSuccess) {
        btnSuccess.addEventListener('click', () => {
            const successModal = document.getElementById('success-modal');
            if (successModal) successModal.classList.remove('active');
            showVideoPopup();
        });
    }

    // Video Modal Continue/Close Button -> Shows Telegram Popup
    const btnVideoDone = document.getElementById('btn-video-continue');
    const btnVideoClose = document.getElementById('btn-close-video');
    const videoPlayer = document.getElementById('popup-video-player');

    const closeVideoHandler = () => {
        if (videoPlayer) videoPlayer.pause();
        const videoModal = document.getElementById('video-modal');
        if (videoModal) videoModal.classList.remove('active');
        showTelegramPopup();
    };

    if (btnVideoDone) btnVideoDone.addEventListener('click', closeVideoHandler);
    if (btnVideoClose) btnVideoClose.addEventListener('click', closeVideoHandler);

    // Telegram Modal Close Button -> Finishes Flow
    const btnTelegramClose = document.getElementById('btn-close-telegram');
    if (btnTelegramClose) {
        btnTelegramClose.addEventListener('click', () => {
            const telegramModal = document.getElementById('telegram-modal');
            if (telegramModal) telegramModal.classList.remove('active');
        });
    }
}

async function showVideoPopup() {
    const settings = await dbApi.select('settings');
    const enabled = settings.find(s => s.key === 'video_popup_enabled')?.value !== 'false';
    if (!enabled) {
        showTelegramPopup();
        return;
    }

    const videos = await dbApi.select('popup_video', { is_enabled: true });
    if (videos.length === 0) {
        showTelegramPopup();
        return;
    }

    const v = videos[0];
    const elTitle = document.getElementById('video-modal-title');
    const elPlayer = document.getElementById('popup-video-player');

    if (elTitle) elTitle.innerText = v.title;
    if (elPlayer) {
        elPlayer.src = v.video_url;
        if (v.autoplay) elPlayer.play().catch(() => {});
    }

    const videoModal = document.getElementById('video-modal');
    if (videoModal) videoModal.classList.add('active');
}

async function showTelegramPopup() {
    const settings = await dbApi.select('settings');
    const enabled = settings.find(s => s.key === 'telegram_popup_enabled')?.value !== 'false';
    if (!enabled) return;

    const telegrams = await dbApi.select('telegram_popup', { is_enabled: true });
    if (telegrams.length === 0) return;

    const t = telegrams[0];
    const elImg = document.getElementById('telegram-popup-img');
    const elTitle = document.getElementById('telegram-modal-title');
    const elDesc = document.getElementById('telegram-modal-desc');
    const elLink = document.getElementById('telegram-modal-link');

    if (elImg) elImg.src = t.image_url;
    if (elTitle) elTitle.innerText = t.title;
    if (elDesc) elDesc.innerText = t.description;
    if (elLink) elLink.href = t.telegram_link;

    const telegramModal = document.getElementById('telegram-modal');
    if (telegramModal) telegramModal.classList.add('active');
}
