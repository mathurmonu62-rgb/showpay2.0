# Project Flow & Architecture

ShowPay 2.0 operates entirely on a serverless frontend architecture communicating directly with Supabase via ES6 Modules.

```
+-------------------------------------------------------------+
|                     Vercel Routing (/)                      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               User Login (/user-app/pages/login.html)       |
+------------------------------+------------------------------+
                               |
                               v (If Success)
+-------------------------------------------------------------+
|               User Home (/user-app/pages/home.html)         |
+------------------------------+------------------------------+
                               |
        +----------------------+----------------------+
        | (After 2s)                                  | (Live)
        v                                             v
+------------------------------+       +------------------------------+
|         MPIN Popup           |       |         Live Slider          |
+---------------+--------------+       +------------------------------+
                |
                v (On Submit)
+------------------------------+
|        Success Popup         |
+---------------+--------------+
                |
                v (Sequential)
+------------------------------+
|         Video Popup          |
+---------------+--------------+
                |
                v (Sequential)
+------------------------------+
|       Telegram Popup         |
+---------------+--------------+
                |
                v (Timer expires)
+------------------------------+
|         Auto Logout          |
+------------------------------+
```

## Modular JS Communication
Each component in `user-app/js/components/` acts independently and subscribes to real-time events via `user-app/js/realtime/`.
