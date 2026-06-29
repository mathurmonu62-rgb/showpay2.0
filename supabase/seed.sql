-- ShowPay 2.0 Sample Seed Data (9 Tables)

-- Seed Slider Images
INSERT INTO public.slider_images (title, image_url, link_url, display_order, is_enabled) VALUES
('A must read for newbies', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', 'https://showpay.com/tutorial', 1, true),
('Maximize Your Profits', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1000&auto=format&fit=crop', 'https://showpay.com/deposit', 2, true)
ON CONFLICT DO NOTHING;

-- Seed Popup Video
INSERT INTO public.popup_video (title, video_url, autoplay, is_enabled) VALUES
('How to use ShowPay Fast', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', true, true)
ON CONFLICT DO NOTHING;

-- Seed Telegram Popup
INSERT INTO public.telegram_popup (title, description, image_url, telegram_link, is_enabled) VALUES
('Join Official Telegram Channel', 'Stay updated with daily high profit tips and instant rewards!', 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', 'https://t.me/showpay_official', true)
ON CONFLICT DO NOTHING;

-- Seed Notifications
INSERT INTO public.notifications (title, message, is_enabled) VALUES
('System Upgrade Complete', 'ShowPay 2.0 is now faster, more secure, and fully real-time!', true)
ON CONFLICT DO NOTHING;

-- Seed Initial Activity Logs
INSERT INTO public.activity_logs (action_type, description, performed_by) VALUES
('System Init', 'ShowPay 2.0 database initialized successfully with seed data', 'System')
ON CONFLICT DO NOTHING;
