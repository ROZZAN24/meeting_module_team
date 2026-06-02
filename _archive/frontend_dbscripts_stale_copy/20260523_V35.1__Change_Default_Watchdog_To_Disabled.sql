-- 20260523_V35.1__Change_Default_Watchdog_To_Disabled.sql
-- Ensure auto_logout_on_face_absence column defaults to 0 and all existing users are set to 0.

UPDATE ad_user_credential SET auto_logout_on_face_absence = 0;
GO
