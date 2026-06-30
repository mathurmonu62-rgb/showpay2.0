import { dbApi } from './config/supabase.js';
import { sharedAuth } from '../../shared/js/auth.js';
import { sharedUtils } from '../../shared/js/utils.js';
import { mpinHelper } from './auth/mpin.js';


document.addEventListener('DOMContentLoaded', async () => {
    // Check session — if no user, go to login
    const currentUser = sharedAuth.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize MPIN helper (sets up all box listeners)
    mpinHelper.init();

    // Load live data from DB
    await loadHomeData();

    // Realtime subscriptions — any admin change updates home instantly
    dbApi.subscribeToChanges('slider_images', () => loadHomeData());
    dbApi.subscribeToChanges('banner_images',  () => loadHomeData());
    dbApi.subscribeToChanges('popup_video',    () => {});
    dbApi.subscribeToChanges('telegram_popup', () => {});
    dbApi.subscribeToChanges('settings',       () => loadHomeData());

    // Start sequential popup flow (with 2s delay)
    startPopupsFlow(currentUser);

    // Floating chat button
    const btnChat = document.getElementById('btn-floating-chat');
    if (btnChat) {
        btnChat.addEventListener('click', () => {
            sharedUtils.showToast("Connecting to live support...", "success");
        });
    }

    // Top up button
    const btnTopup = document.getElementById('btn-topup-action');
    if (btnTopup) {
        btnTopup.addEventListener('click', () => {
            sharedUtils.showToast("Opening Top up menu...", "success");
        });
    }
});


// ====================================================
// LOAD HOME DATA FROM DB (settings + sliders)
// ====================================================
async function loadHomeData() {
    try {
        const settings = await dbApi.select('settings');
        const getSetting = (k, def) => {
            const found = settings.find(s => s.key === k);
            return found ? found.value : def;
        };

        // Update ratio card values
        const usdtRatio  = getSetting('usdt_inr_ratio', '107.61');
        const bonusRatio = getSetting('bonus_ratio', '4%');
        const topupBonus = getSetting('topup_bonus_ratio', '2%');

        const elUsdt  = document.getElementById('usdt-ratio-text');
        const elBonus = document.getElementById('bonus-ratio-text');
        const elTopup = document.getElementById('topup-bonus-sub');

        if (elUsdt)  elUsdt.innerText  = `1 USDT ≈ ${usdtRatio} INR`;
        if (elBonus) elBonus.innerText = bonusRatio;
        if (elTopup) elTopup.innerText = `Bonus ratio: ${topupBonus}`;

        // Load Slider Images
        const sliderEnabled = getSetting('slider_enabled', 'true') === 'true';
        const sliderContainer = document.getElementById('home-slider-container');

        if (sliderEnabled && sliderContainer) {
            sliderContainer.style.display = 'block';
            const sliders = await dbApi.select('slider_images', { is_enabled: true });

            if (sliders.length > 0) {
                sliders.sort((a, b) => a.display_order - b.display_order);
                const promoImg = document.getElementById('promo-img');
                const dotsContainer = document.getElementById('slider-dots-container');

                if (promoImg) {
                    let currentIndex = 0;

                    const updateSlider = () => {
                        promoImg.style.opacity = '0';
                        setTimeout(() => {
                            promoImg.src = sliders[currentIndex].image_url;
                            promoImg.style.opacity = '1';
                        }, 200);

                        if (dotsContainer) {
                            dotsContainer.innerHTML = '';
                            sliders.forEach((_, idx) => {
                                const dot = document.createElement('span');
                                dot.className = 'dot' + (idx === currentIndex ? ' active' : '');
                                dotsContainer.appendChild(dot);
                            });
                        }
                    };

                    updateSlider();

                    if (window.homeSliderInterval) clearInterval(window.homeSliderInterval);
                    if (sliders.length > 1) {
                        window.homeSliderInterval = setInterval(() => {
                            currentIndex = (currentIndex + 1) % sliders.length;
                            updateSlider();
                        }, 3000);
                    }
                }
            }
        } else if (sliderContainer) {
            sliderContainer.style.display = 'none';
            if (window.homeSliderInterval) clearInterval(window.homeSliderInterval);
        }
    } catch (err) {
        console.error('Failed to load home data:', err);
    }
}


// ====================================================
// SEQUENTIAL POPUP FLOW
// MPIN (2s delay) → Success (2s) → Video → Telegram → Logout
// ====================================================
async function startPopupsFlow(currentUser) {
    try {
        const settings = await dbApi.select('settings');
        const getSetting = (k, def) => {
            const found = settings.find(s => s.key === k);
            return found ? found.value : def;
        };

        const delayMs = parseInt(getSetting('mpin_delay_seconds', '2')) * 1000;

        // --- MPIN Popup ---
        if (!currentUser.mpin || currentUser.mpin === '') {
            // Show MPIN popup after delay
            setTimeout(() => {
                const mpinModal = document.getElementById('mpin-modal');
                if (mpinModal) mpinModal.classList.add('active');
            }, delayMs);
        } else {
            // MPIN already set — go straight to video after delay
            setTimeout(() => showVideoPopup(), delayMs);
        }

        // After MPIN submit (success message auto-fires, then this event triggers video)
        document.addEventListener('mpin_complete', () => {
            showVideoPopup();
        });

        // --- Video Close (X) → LOGOUT (not telegram) ---
        const btnVideoClose = document.getElementById('btn-close-video');
        const videoPlayer = document.getElementById('popup-video-player');

        if (btnVideoClose) {
            btnVideoClose.addEventListener('click', () => {
                if (videoPlayer) videoPlayer.pause();
                const videoModal = document.getElementById('video-modal');
                if (videoModal) videoModal.classList.remove('active');
                // Close video by X → logout
                sharedAuth.logoutUser();
            });
        }

        // --- Video ends naturally → Telegram popup ---
        if (videoPlayer) {
            videoPlayer.addEventListener('ended', () => {
                const videoModal = document.getElementById('video-modal');
                if (videoModal) videoModal.classList.remove('active');
                showTelegramPopup();
            });
        }

        // --- Telegram Cancel → Logout ---
        const btnTelegramClose = document.getElementById('btn-close-telegram');
        if (btnTelegramClose) {
            btnTelegramClose.addEventListener('click', () => {
                const telegramModal = document.getElementById('telegram-modal');
                if (telegramModal) telegramModal.classList.remove('active');
                sharedAuth.logoutUser();
            });
        }

        // --- Telegram Join link → logout after a brief delay (user joined) ---
        const telegramJoinLink = document.getElementById('telegram-modal-link');
        if (telegramJoinLink) {
            telegramJoinLink.addEventListener('click', () => {
                setTimeout(() => {
                    sharedAuth.logoutUser();
                }, 1500);
            });
        }

    } catch (err) {
        console.error('Failed to start popup flow:', err);
    }
}


// ====================================================
// SHOW VIDEO POPUP
// ====================================================
async function showVideoPopup() {
    try {
        const settings = await dbApi.select('settings');
        const videoEnabled = settings.find(s => s.key === 'video_popup_enabled')?.value !== 'false';

        if (!videoEnabled) {
            showTelegramPopup();
            return;
        }

        const videos = await dbApi.select('popup_video', { is_enabled: true });
        if (videos.length === 0) {
            showTelegramPopup();
            return;
        }

        const v = videos[0];
        const elTitle  = document.getElementById('video-modal-title');
        const elPlayer = document.getElementById('popup-video-player');

        if (elTitle)  elTitle.innerText = v.title || 'ShowPay Tutorial';
        if (elPlayer) {
            elPlayer.src = v.video_url;
            if (v.autoplay) {
                elPlayer.play().catch(() => {
                    // Autoplay blocked by browser — show controls
                    elPlayer.controls = true;
                });
            }
        }

        const videoModal = document.getElementById('video-modal');
        if (videoModal) videoModal.classList.add('active');

    } catch (err) {
        console.error('Failed to show video popup:', err);
        showTelegramPopup();
    }
}


// ====================================================
// SHOW TELEGRAM POPUP
// ====================================================
async function showTelegramPopup() {
    try {
        const settings = await dbApi.select('settings');
        const telegramEnabled = settings.find(s => s.key === 'telegram_popup_enabled')?.value !== 'false';

        if (!telegramEnabled) {
            sharedAuth.logoutUser();
            return;
        }

        const telegrams = await dbApi.select('telegram_popup', { is_enabled: true });
        if (telegrams.length === 0) {
            sharedAuth.logoutUser();
            return;
        }

        const t = telegrams[0];
        const elTitle = document.getElementById('telegram-modal-title');
        const elDesc  = document.getElementById('telegram-modal-desc');
        const elLink  = document.getElementById('telegram-modal-link');

        if (elTitle) elTitle.innerText = t.title || 'Telegram';
        if (elDesc)  elDesc.innerText  = t.description || 'Join our official Telegram channel.';
        if (elLink)  elLink.href       = t.telegram_link || 'https://t.me/showpay_official';

        const telegramModal = document.getElementById('telegram-modal');
        if (telegramModal) telegramModal.classList.add('active');

    } catch (err) {
        console.error('Failed to show telegram popup:', err);
        sharedAuth.logoutUser();
    }
}
