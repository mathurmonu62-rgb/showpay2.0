# Admin Flow & Control System

The admin dashboard located in `admin-app/pages/` provides granular control over the user experience and real-time popups.

## Fixed Admin Login
- **Email**: `admin@showpay.com`
- **Password**: `admin@0123`

## Subsystems
1. **Dashboard (`dashboard.html`)**: Real-time metrics tracking total users, pending verifications, active sliders, and telegram status.
2. **Users (`users.html` & `user-details.html`)**: Interactive list featuring instant search (`js/search.js`), status filters (`js/filters.js`), Gmail forwarding (`js/gmail.js`), and PDF export (`js/pdf.js`).
3. **Dynamic Content Managers (`slider.html`, `video-popup.html`, `telegram-popup.html`)**: Modifying these records instantly triggers a Supabase real-time broadcast to all connected user applications.
4. **Recycle Bin (`trash.html`)**: Soft-deleted users are archived here with options to restore or permanently purge.
