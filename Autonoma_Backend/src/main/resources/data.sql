-- Automatically seed the admin user with BCrypt encrypted password 'admin'
INSERT INTO USER_CREDENTIALS (USER_ID, EMP_ID, PASSWORD, CREATED_BY, STATUS)
SELECT 'admin', 1, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAg6S7iP6QN/8nS8fyWMmH9f2i1u.', 'SYSTEM', 1
WHERE NOT EXISTS (SELECT 1 FROM USER_CREDENTIALS WHERE USER_ID = 'admin');

