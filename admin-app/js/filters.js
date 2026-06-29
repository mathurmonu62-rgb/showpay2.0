export const filterHelper = {
    filterByStatus(users, status) {
        if (!status || status === 'all') return users;
        return users.filter(u => u.status === status);
    },
    sortUsers(users, sortBy) {
        const copy = [...users];
        copy.sort((a, b) => {
            if (sortBy === 'last_login') {
                return new Date(b.last_login) - new Date(a.last_login);
            } else {
                return b.login_count - a.login_count;
            }
        });
        return copy;
    }
};
