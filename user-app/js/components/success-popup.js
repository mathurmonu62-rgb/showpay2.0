import { ModalBase } from '../../../shared/components/modal-base.js';

export class SuccessPopupComponent {
    static show(message, onComplete) {
        const content = `
            <div style="font-size: 54px; text-align: center; margin-bottom: 16px;">🎉</div>
            <div class="popup-title">Success!</div>
            <div class="popup-desc">${message}</div>
            <button class="btn btn-primary" id="btn-success-ok">Great</button>
        `;

        ModalBase.create('success-popup-modal', content);
        ModalBase.show('success-popup-modal');

        document.getElementById('btn-success-ok').addEventListener('click', () => {
            ModalBase.hide('success-popup-modal');
            if (onComplete) onComplete();
        });
    }
}
