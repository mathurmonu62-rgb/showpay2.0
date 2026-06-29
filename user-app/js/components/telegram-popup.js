import { ModalBase } from '../../../shared/components/modal-base.js';
import { userDbApi } from '../config/supabase.js';

export class TelegramPopupComponent {
    static async show(onComplete) {
        const items = await userDbApi.select('telegram_popup', { is_enabled: true });
        if (items.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        const t = items[0];

        const content = `
            <div class="telegram-logo-container">
                <img src="${t.image_url}" alt="Telegram">
            </div>
            <div class="popup-title">${t.title}</div>
            <div class="popup-desc">${t.description}</div>
            <a href="${t.telegram_link}" target="_blank" class="btn btn-primary" style="margin-bottom: 12px;">Join Telegram Channel</a>
            <button class="btn btn-secondary" id="btn-telegram-close">Later</button>
        `;

        ModalBase.create('telegram-popup-modal', content);
        ModalBase.show('telegram-popup-modal');

        document.getElementById('btn-telegram-close').addEventListener('click', () => {
            ModalBase.hide('telegram-popup-modal');
            if (onComplete) onComplete();
        });
    }
}
