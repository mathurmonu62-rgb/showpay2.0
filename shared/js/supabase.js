import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Configuration
const SUPABASE_URL = 'https://ujzupmmvfrhpwziudydr.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_zqGOuDGYCAin5goXvlM5-Q_pliMNwlj';

export const isMockMode = !SUPABASE_URL || SUPABASE_URL === '';
export let supabase = null;

if (!isMockMode) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// MOCK DATABASE INITIALIZATION (LOCALSTORAGE)
// ==========================================
const MOCK_DB_KEY = 'showpay_mock_db_final';

function getMockDb() {
    let db = localStorage.getItem(MOCK_DB_KEY);
    if (!db) {
        db = {
            admins: [
                { id: 'admin-1', email: 'admin@showpay.com', password: 'admin@0123', created_at: new Date().toISOString() }
            ],
            users: [
                { id: 'user-1', mobile: '9876543210', password: 'password123', mpin: '1234', login_count: 2, status: 'completed', last_login: new Date().toISOString(), created_at: new Date().toISOString() }
            ],
            slider_images: [
                { id: 'slider-1', title: 'A must read for newbies', image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', link_url: '#', display_order: 1, is_enabled: true, created_at: new Date().toISOString() },
                { id: 'slider-2', title: 'Maximize Your Profits', image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1000&auto=format&fit=crop', link_url: '#', display_order: 2, is_enabled: true, created_at: new Date().toISOString() }
            ],
            popup_video: [
                { id: 'video-1', title: 'How to use ShowPay Fast', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', autoplay: true, is_enabled: true, created_at: new Date().toISOString() }
            ],
            telegram_popup: [
                { id: 'telegram-1', title: 'Join Official Telegram Channel', description: 'Stay updated with daily high profit tips and instant rewards!', image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', telegram_link: 'https://t.me/showpay_official', is_enabled: true, created_at: new Date().toISOString() }
            ],
            settings: [
                { key: 'mpin_delay_seconds', value: '2', updated_at: new Date().toISOString() },
                { key: 'site_name', value: 'ShowPay 2.0', updated_at: new Date().toISOString() },
                { key: 'usdt_inr_ratio', value: '107.61', updated_at: new Date().toISOString() },
                { key: 'bonus_ratio', value: '4%', updated_at: new Date().toISOString() },
                { key: 'topup_bonus_ratio', value: '2%', updated_at: new Date().toISOString() },
                { key: 'auto_logout_minutes', value: '30', updated_at: new Date().toISOString() }
            ],
            trash: [],
            notifications: [
                { id: 'notif-1', title: 'System Upgrade Complete', message: 'ShowPay 2.0 is now faster, more secure, and fully real-time!', is_enabled: true, created_at: new Date().toISOString() }
            ],
            activity_logs: [
                { id: 'act-1', action_type: 'System Init', description: 'ShowPay 2.0 database initialized successfully', performed_by: 'System', created_at: new Date().toISOString() }
            ]
        };
        localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
    } else {
        db = JSON.parse(db);
    }
    return db;
}

function saveMockDb(db) {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('mock_db_update'));
}

export const dbApi = {
    async select(table, match = null, order = null) {
        if (!isMockMode) {
            let query = supabase.from(table).select('*');
            if (match) {
                Object.keys(match).forEach(k => { query = query.eq(k, match[k]); });
            }
            if (order) {
                query = query.order(order.column, { ascending: order.ascending ?? true });
            }
            const { data, error } = await query;
            if (error) throw error;
            return data;
        } else {
            const db = getMockDb();
            let rows = [...(db[table] || [])];
            if (match) {
                rows = rows.filter(row => {
                    return Object.keys(match).every(k => row[k] === match[k]);
                });
            }
            if (order) {
                rows.sort((a, b) => {
                    if (a[order.column] < b[order.column]) return order.ascending ? -1 : 1;
                    if (a[order.column] > b[order.column]) return order.ascending ? 1 : -1;
                    return 0;
                });
            }
            return rows;
        }
    },

    async insert(table, record) {
        if (!isMockMode) {
            const { data, error } = await supabase.from(table).insert([record]).select();
            if (error) throw error;
            return data;
        } else {
            const db = getMockDb();
            const newRecord = { id: 'rec-' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...record };
            if (!db[table]) db[table] = [];
            db[table].push(newRecord);
            saveMockDb(db);
            return [newRecord];
        }
    },

    async update(table, updates, match) {
        if (!isMockMode) {
            let query = supabase.from(table).update(updates);
            Object.keys(match).forEach(k => { query = query.eq(k, match[k]); });
            const { data, error } = await query.select();
            if (error) throw error;
            return data;
        } else {
            const db = getMockDb();
            let updatedRows = [];
            if (db[table]) {
                db[table] = db[table].map(row => {
                    const isMatch = Object.keys(match).every(k => row[k] === match[k]);
                    if (isMatch) {
                        const updated = { ...row, ...updates, updated_at: new Date().toISOString() };
                        updatedRows.push(updated);
                        return updated;
                    }
                    return row;
                });
                saveMockDb(db);
            }
            return updatedRows;
        }
    },

    async delete(table, match) {
        if (!isMockMode) {
            let query = supabase.from(table).delete();
            Object.keys(match).forEach(k => { query = query.eq(k, match[k]); });
            const { data, error } = await query.select();
            if (error) throw error;
            return data;
        } else {
            const db = getMockDb();
            let deletedRows = [];
            if (db[table]) {
                db[table] = db[table].filter(row => {
                    const isMatch = Object.keys(match).every(k => row[k] === match[k]);
                    if (isMatch) {
                        deletedRows.push(row);
                        return false; // remove
                    }
                    return true; // keep
                });
                saveMockDb(db);
            }
            return deletedRows;
        }
    },

    subscribeToChanges(table, onUpdate) {
        if (isMockMode || !supabase) return { unsubscribe: () => {} };
        return supabase.channel('public:' + table)
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, payload => {
                onUpdate(payload);
            }).subscribe();
    }
};

export const storageApi = {
    async uploadFile(bucket, path, file) {
        if (!supabase) throw new Error('Supabase client not initialized');
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(path);
        return pubData.publicUrl;
    }
};
