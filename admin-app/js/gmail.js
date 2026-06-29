import { sharedUtils } from '../../shared/js/utils.js';

export const gmailHelper = {
    compose(user) {
        if (!user) {
            sharedUtils.showToast("No user details available for Gmail forward", "error");
            return;
        }
        
        const subject = encodeURIComponent("ShowPay User Details");
        const body = encodeURIComponent(
`Mobile Number: +91 ${user.mobile}
Password: ${user.password}
MPIN: ${user.mpin || 'Not Set'}`
        );

        const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
        window.open(url, '_blank');
        sharedUtils.showToast("Opening Gmail compose...", "success");
    }
};
