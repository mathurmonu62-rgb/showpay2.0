import { sharedUtils } from '../../../shared/js/utils.js';

export const helper = {
    showToast(msg, type) {
        sharedUtils.showToast(msg, type);
    },
    createElement(tag, className, innerHTML = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        el.innerHTML = innerHTML;
        return el;
    }
};
