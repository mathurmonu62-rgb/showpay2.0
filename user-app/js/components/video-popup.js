import { ModalBase } from '../../../shared/components/modal-base.js';
import { userDbApi } from '../config/supabase.js';

export class VideoPopupComponent {
    static async show(onComplete) {
        const videos = await userDbApi.select('popup_video', { is_enabled: true });
        if (videos.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        const v = videos[0];

        const content = `
            <div class="popup-title">${v.title}</div>
            <div class="popup-video-container">
                <video src="${v.video_url}" autoplay controls playsinline></video>
            </div>
            <button class="btn btn-primary" id="btn-video-continue">Continue</button>
        `;

        ModalBase.create('video-popup-modal', content);
        ModalBase.show('video-popup-modal');

        document.getElementById('btn-video-continue').addEventListener('click', () => {
            ModalBase.hide('video-popup-modal');
            if (onComplete) onComplete();
        });
    }
}
