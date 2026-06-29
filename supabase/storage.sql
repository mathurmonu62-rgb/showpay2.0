-- ShowPay 2.0 Supabase Storage Buckets Configuration

-- Create storage bucket for slider images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('slider-images', 'slider-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for popup videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('popup-videos', 'popup-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for telegram assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('telegram-assets', 'telegram-assets', true)
ON CONFLICT (id) DO NOTHING;
