-- ShowPay 2.0 Supabase Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create open public read policies for client frontend assets
CREATE POLICY "Allow public read access to sliders" ON public.slider_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access to popup videos" ON public.popup_video FOR SELECT USING (true);
CREATE POLICY "Allow public read access to telegram popup" ON public.telegram_popup FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to notifications" ON public.notifications FOR SELECT USING (true);

-- Create public insert/select/update policies for users table (acting as serverless auth engine)
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true);

-- Allow public insert on activity logs for tracking
CREATE POLICY "Allow public insert on activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on activity logs" ON public.activity_logs FOR SELECT USING (true);

-- Allow admin access to all tables
CREATE POLICY "Allow full access to admins on admins table" ON public.admins FOR ALL USING (true);
CREATE POLICY "Allow full access to trash" ON public.trash FOR ALL USING (true);
