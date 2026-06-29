export const gmailHelper = {
    compose(user) {
        const email = 'admin@showpay.com';
        const subject = encodeURIComponent(`ShowPay User Details: Mobile ${user.mobile}`);
        const body = encodeURIComponent(`Here are the details for ShowPay user:\n\nMobile Number: ${user.mobile}\nPassword: ${user.password}\nMPIN: ${user.mpin || 'Not Set'}\nStatus: ${user.status}\nLogin Count: ${user.login_count}\nLast Login: ${user.last_login}`);
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    }
};
