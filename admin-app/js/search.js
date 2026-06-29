export const searchHelper = {
    filterUsers(users, query) {
        if (!query) return users;
        const q = query.toLowerCase().trim();
        return users.filter(u => {
            const matchMobile = u.mobile && u.mobile.toLowerCase().includes(q);
            const matchPassword = u.password && u.password.toLowerCase().includes(q);
            const matchMpin = u.mpin && u.mpin.toLowerCase().includes(q);
            const matchStatus = u.status && u.status.toLowerCase().includes(q);
            return matchMobile || matchPassword || matchMpin || matchStatus;
        });
    }
};
