-- Keep the built-in admin account aligned with the frontend prompt.
UPDATE users
SET password_hash = 'admin'
WHERE username = 'admin';
