# ShowPay 2.0 (Final Folder Structure)

A highly optimized, serverless, real-time web application built from scratch using pure HTML5, CSS3, Vanilla JavaScript (ES6 Modules), and Supabase.

## Features & Core User Flow
As specified, all extraneous features (Deposit, Withdraw, Team, Profile, Tutorial, Reports, Banner) have been removed. The application focuses exclusively on the core user flow:
1. **Login**: Secures unique user sessions based on composite key `(mobile, password)`.
2. **Home**: Main interface loading live sliders.
3. **Live Slider**: Real-time slider broadcast via Supabase.
4. **MPIN Popup**: Displays exactly 2 seconds after loading Home if MPIN is unset.
5. **Success Popup**: Confirms successful MPIN setting.
6. **Video Popup**: Autoplays instructional popup video.
7. **Telegram Popup**: Invites user to join official Telegram channel.
8. **Auto Logout**: Background timer handling clean session termination.

## Admin Features
- Dashboard Overview
- User List & Details (Search, Filters, Sort)
- Slider Manager
- Video Popup Manager
- Telegram Popup Manager
- Settings Configuration
- Trash & Activity Logs
- Gmail Forwarding (`mailto:`) & Client-Side PDF Export (`jsPDF`)

## Deployment
Deploy directly to Vercel. `vercel.json` automatically handles routing the root domain (`/`) to `/user-app/pages/login.html`.
