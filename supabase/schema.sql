-- ============================================================
-- SHOWPAY 2.0 — SUPABASE SCHEMA
-- Project: https://ujzupmmvfrhpwziudydr.supabase.co
-- ============================================================

-- 1. TABLES CREATION

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.admins (email, password)
VALUES ('admin@showpay.com', 'admin@0123') ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile TEXT NOT NULL,
    password TEXT NOT NULL,
    mpin TEXT DEFAULT NULL,
    login_count INT DEFAULT 1 NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mobile, password)
);

CREATE TABLE IF NOT EXISTS public.slider_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    display_order INT DEFAULT 0 NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.popup_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    autoplay BOOLEAN DEFAULT true NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.telegram_popup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    telegram_link TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.settings (key, value) VALUES
('mpin_delay_seconds', '2'),
('site_name', 'ShowPay 2.0'),
('usdt_inr_ratio', '107.61'),
('bonus_ratio', '4%'),
('topup_bonus_ratio', '2%'),
('auto_logout_minutes', '30')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

CREATE TABLE IF NOT EXISTS public.trash (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_table TEXT NOT NULL,
    record_id UUID NOT NULL,
    record_data JSONB NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. SEED DATA
-- ============================================================

INSERT INTO public.slider_images (title, image_url, link_url, display_order, is_enabled) VALUES
('A must read for newbies', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', '#', 1, true),
('Maximize Your Profits', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1000&auto=format&fit=crop', '#', 2, true);

INSERT INTO public.popup_video (title, video_url, autoplay, is_enabled) VALUES
('How to use ShowPay Fast', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', true, true);

INSERT INTO public.telegram_popup (title, description, image_url, telegram_link, is_enabled) VALUES
('Join Official Telegram Channel', 'Stay updated with daily high profit tips and instant rewards!', 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', 'https://t.me/showpay_official', true);

INSERT INTO public.notifications (title, message, is_enabled) VALUES
('System Upgrade Complete', 'ShowPay 2.0 is now faster, more secure, and fully real-time!', true);

INSERT INTO public.activity_logs (action_type, description, performed_by) VALUES
('System Init', 'ShowPay 2.0 database initialized successfully with seed data', 'System');

-- ============================================================
-- 3. DISABLE RLS FOR FREE SERVERLESS EXECUTION
-- ============================================================

ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.slider_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_video DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_popup DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. CREATE STORAGE BUCKETS FOR UPLOADS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('slider_images', 'slider_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('popup_video', 'popup_video', true) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. FIX STORAGE RLS UPLOAD ERROR (ALLOW PUBLIC UPLOADS)
-- ============================================================

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT TO public
    USING ( bucket_id IN ('slider_images', 'popup_video') );

CREATE POLICY "Public Uploads" ON storage.objects
    FOR INSERT TO public
    WITH CHECK ( bucket_id IN ('slider_images', 'popup_video') );
