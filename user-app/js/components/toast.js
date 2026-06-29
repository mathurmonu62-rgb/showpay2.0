import { helper } from '../utils/helper.js';

export class ToastComponent {
    static success(msg) { helper.showToast(msg, 'success'); }
    static error(msg) { helper.showToast(msg, 'error'); }
}
