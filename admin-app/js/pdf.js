import { sharedUtils } from '../../shared/js/utils.js';

export const pdfHelper = {
    exportUser(u) {
        if (!window.jspdf) {
            sharedUtils.showToast("PDF generator library not loaded.", "error");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("ShowPay User Profile Export", 20, 20);

        doc.setFontSize(14);
        doc.text(`Mobile Number: +91 ${u.mobile}`, 20, 40);
        doc.text(`Password: ${u.password}`, 20, 50);
        doc.text(`MPIN: ${u.mpin || 'Not Set'}`, 20, 60);
        doc.text(`Status: ${u.status.toUpperCase()}`, 20, 70);
        doc.text(`Login Count: ${u.login_count}`, 20, 80);
        doc.text(`Created Date: ${sharedUtils.formatDate(u.created_at)}`, 20, 90);
        doc.text(`Created Time: ${sharedUtils.formatTime(u.created_at)}`, 20, 100);
        doc.text(`Last Login: ${sharedUtils.formatDate(u.last_login)} ${sharedUtils.formatTime(u.last_login)}`, 20, 110);

        doc.save(`ShowPay_User_${u.mobile}.pdf`);
        sharedUtils.showToast("User PDF downloaded!", "success");
    },

    exportAllUsers(users) {
        if (!window.jspdf) {
            sharedUtils.showToast("PDF generator library not loaded.", "error");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("ShowPay Complete Users Report", 14, 20);

        doc.setFontSize(10);
        let y = 35;
        doc.text("Mobile", 14, y);
        doc.text("Password", 45, y);
        doc.text("MPIN", 80, y);
        doc.text("Status", 105, y);
        doc.text("Logins", 135, y);
        doc.text("Date", 155, y);
        doc.text("Time", 180, y);

        doc.setLineWidth(0.5);
        doc.line(14, y + 2, 195, y + 2);
        y += 10;

        users.forEach((u, i) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`+91 ${u.mobile}`, 14, y);
            doc.text(`${u.password}`, 45, y);
            doc.text(`${u.mpin || 'N/A'}`, 80, y);
            doc.text(`${u.status.toUpperCase()}`, 105, y);
            doc.text(`${u.login_count}`, 135, y);
            doc.text(`${sharedUtils.formatDate(u.created_at)}`, 155, y);
            doc.text(`${sharedUtils.formatTime(u.created_at)}`, 180, y);
            y += 8;
        });

        doc.save("ShowPay_All_Users_Report.pdf");
        sharedUtils.showToast("All Users PDF downloaded!", "success");
    }
};
