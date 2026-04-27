-- Force update the admin user to ensure the password is always correct ('admin')
DELETE FROM USER_CREDENTIALS WHERE USER_ID = 'admin';
INSERT INTO USER_CREDENTIALS (USER_ID, EMP_ID, PASSWORD, CREATED_BY, STATUS)
VALUES ('admin', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'SYSTEM', 1);
