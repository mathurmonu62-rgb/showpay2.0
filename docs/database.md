# Database Architecture

ShowPay 2.0 incorporates exactly 9 Supabase tables to support the streamlined workflow:

1. **`admins`**: Stores fixed administrator credentials.
2. **`users`**: Maintains end-user state, login counts, MPINs, and composite unique keys.
3. **`slider_images`**: Live carousel items with display ordering.
4. **`popup_video`**: Real-time video popups with autoplay settings.
5. **`telegram_popup`**: Official Telegram promotion data.
6. **`settings`**: Key-value store for global settings (e.g., MPIN delay timer).
7. **`trash`**: Recycle bin storage for soft-deleted records.
8. **`notifications`**: System broadcast messages.
9. **`activity_logs`**: Comprehensive system audit trails.
