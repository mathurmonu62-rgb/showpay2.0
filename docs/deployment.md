# Deployment Guide

ShowPay 2.0 is completely serverless. It requires no Node.js backend or Express server.

## Deploying to Vercel
1. Connect your GitHub repository to Vercel.
2. Keep the Framework Preset as `Other` (Static).
3. Vercel will automatically read `vercel.json` to configure the correct routing rewrite rules.

## Configuring Supabase
1. Create a project on Supabase.
2. Go to the SQL Editor and execute `supabase/schema.sql`, `supabase/realtime.sql`, `supabase/policies.sql`, and `supabase/seed.sql`.
3. Copy your project URL and Anon Key into `shared/js/supabase.js` and `user-app/js/config/supabase.js`.
