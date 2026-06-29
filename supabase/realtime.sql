-- ShowPay 2.0 Supabase Realtime Broadcast Configuration

-- Enable real-time for live dynamic updates across client applications
ALTER PUBLICATION supabase_realtime ADD TABLE public.slider_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.popup_video;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_popup;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
