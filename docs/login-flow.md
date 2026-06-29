# Login Flow & Business Rules

The authentication engine enforced in `user-app/js/auth/login.js` adheres to strict multi-login verification rules.

## Unique Key Definition
The database table `users` establishes a composite unique constraint on `(mobile, password)`. This guarantees that:
- Same Mobile + Different Password = New User Flow / Unlimited Logins.
- Different Mobile + Same Password = New User Flow / Unlimited Logins.

## Max 3 Logins Rule
When a user attempts to log in with the exact same `(mobile, password)` pair:
1. `login_count` is inspected.
2. If `login_count` < 3, `login_count` increments by 1 and permits entry.
3. On the 4th login attempt, the user's status updates to `pending` and the system returns the error:
   > "Your verification already under pending."
4. Access to `home.html` is blocked until an administrator restores or marks the account as `completed`.
