import { sharedUtils } from '../../../shared/js/utils.js';

export const formatter = {
    date(str) { return sharedUtils.formatDate(str); },
    time(str) { return sharedUtils.formatTime(str); },
    currency(num) { return `₹${Number(num).toFixed(2)}`; }
};
