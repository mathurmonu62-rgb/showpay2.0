export const searchHelper = {
    filterUsers(users, query) {
        if (!query || query.trim() === '') return users;
        const q = query.trim().toLowerCase();
        return users.filter(u => u.mobile.toLowerCase().includes(q));
    }
};
