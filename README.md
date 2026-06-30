# ShowPay 2.0

A lightweight fintech web app built with pure HTML5, CSS3, and Vanilla JavaScript (ES6 Modules) + Supabase backend.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JS (ES6 Modules)
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **Hosting**: Vercel
- **Version Control**: GitHub

## Project Structure

```
ShowPay/
├── user-app/       → User-facing app (Login → MPIN → Home → Popups)
├── admin-app/      → Admin panel (Dashboard, Users, Popups, Settings)
├── shared/         → Shared assets and utilities
├── supabase/       → SQL schema, policies, seed data
├── docs/           → Project documentation
└── public/         → Static public assets
```

## Flow
`Login` → `MPIN Verify` → `Home` → `Video Popup` → `Telegram Popup` → `Auto Logout`

## Supabase Tables
- `admins`, `users`, `slider_images`, `popup_video`, `telegram_popup`, `settings`, `trash`, `notifications`, `activity_logs`

## Getting Started
1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Run `npm run dev` for local development server
4. Deploy to Vercel via GitHub

## Deployment
See [docs/deployment.md](docs/deployment.md)
