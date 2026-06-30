// ============================================================
// SHOWPAY 2.0 — COMPONENT: VIDEO POPUP
// Shows video if popup_video.is_enabled = true
// ============================================================

const overlay = document.getElementById('video-popup-overlay');
const videoEl = document.getElementById('main-video');
const sourceEl = document.getElementById('video-source');
const closeBtn = document.getElementById('video-close-btn');

let onCloseCallback = null;

/**
 * Show video popup if enabled
 * @param {Object} videoData - row from popup_video table
 * @param {Function} onClose - callback when video is closed
 */
export function showVideoPopup(videoData, onClose) {
  if (!videoData?.is_enabled || !videoData?.video_url) {
    onClose?.();
    return;
  }

  onCloseCallback = onClose;
  sourceEl.src = videoData.video_url;
  videoEl.load();
  videoEl.muted = true;
  overlay.classList.add('active');
  videoEl.play().catch(() => {});
}

export function hideVideoPopup() {
  overlay.classList.remove('active');
  videoEl.pause();
  videoEl.src = '';
  onCloseCallback?.();
  onCloseCallback = null;
}

closeBtn?.addEventListener('click', hideVideoPopup);
