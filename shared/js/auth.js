import { dbApi } from './supabase.js';

export const sharedAuth = {
    async loginUser(mobile, password) {
        const users = await dbApi.select('users', { mobile, password });
        let user = users.length > 0 ? users[0] : null;

        if (user) {
            if (user.login_count >= 3 && user.status === 'pending') {
                return { success: false, error: "Your verification already under pending." };
            }

            const newCount = user.login_count + 1;
            if (newCount >= 4) {
                await dbApi.update('users', { login_count: newCount, status: 'pending', last_login: new Date().toISOString() }, { id: user.id });
                return { success: false, error: "Your verification already under pending." };
            }

            const updatedUsers = await dbApi.update('users', { login_count: newCount, last_login: new Date().toISOString() }, { id: user.id });
            user = updatedUsers[0] || user;
        } else {
            const newUsers = await dbApi.insert('users', {
                mobile,
                password,
                mpin: null,
                login_count: 1,
                status: 'completed',
                last_login: new Date().toISOString()
            });
            user = newUsers[0];
        }

        await dbApi.insert('activity_logs', {
            action_type: 'User Login',
            description: `User login successful for mobile ${mobile}`,
            performed_by: mobile
        });

        localStorage.setItem('showpay_user_session', JSON.stringify(user));
        return { success: true, user };
    },

    async loginAdmin(email, password) {
        const admins = await dbApi.select('admins', { email, password });
        if (admins.length > 0) {
            const admin = admins[0];
            localStorage.setItem('showpay_admin_session', JSON.stringify(admin));
            await dbApi.insert('activity_logs', {
                action_type: 'Admin Login',
                description: `Admin login successful for ${email}`,
                performed_by: email
            });
            return { success: true, admin };
        } else {
            return { success: false, error: "Invalid admin email or password." };
        }
    },

    getCurrentUser() {
        const session = localStorage.getItem('showpay_user_session');
        return session ? JSON.parse(session) : null;
    },

    getCurrentAdmin() {
        const session = localStorage.getItem('showpay_admin_session');
        return session ? JSON.parse(session) : null;
    },

    logoutUser() {
        localStorage.removeItem('showpay_user_session');
        window.location.href = '../pages/login.html';
    },

    logoutAdmin() {
        localStorage.removeItem('showpay_admin_session');
        window.location.href = '../pages/login.html';
    }
};
