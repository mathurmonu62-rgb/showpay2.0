import { sharedUtils } from '../../shared/js/utils.js';

export const pdfHelper = {
    exportUser(user) {
        if (!window.jspdf) {
            sharedUtils.showToast("jsPDF library not loaded.", "error");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(0, 132, 255);
        doc.text(`ShowPay User Profile: ${user.mobile}`, 20, 30);
        
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(`Mobile Number: +91 ${user.mobile}`, 20, 50);
        doc.text(`Password: ${user.password}`, 20, 62);
        doc.text(`MPIN: ${user.mpin || 'Not Set'}`, 20, 74);
        doc.text(`Account Status: ${user.status.toUpperCase()}`, 20, 86);
        doc.text(`Total Login Count: ${user.login_count}`, 20, 98);
        doc.text(`Last Login Time: ${sharedUtils.formatDate(user.last_login)} ${sharedUtils.formatTime(user.last_login)}`, 20, 110);
        doc.text(`Registered Date: ${sharedUtils.formatDate(user.created_at)}`, 20, 122);
        
        doc.save(`user_${user.mobile}.pdf`);
        sharedUtils.showToast("PDF Downloaded successfully!", "success");
    }
};
