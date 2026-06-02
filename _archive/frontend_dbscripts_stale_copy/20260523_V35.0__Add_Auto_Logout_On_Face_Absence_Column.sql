-- 20260523_V35.0__Add_Auto_Logout_On_Face_Absence_Column.sql
-- Add auto_logout_on_face_absence column to ad_user_credential table for central admin control.

ALTER TABLE ad_user_credential ADD auto_logout_on_face_absence INT DEFAULT 0;
GO

UPDATE ad_user_credential SET auto_logout_on_face_absence = 0 WHERE auto_logout_on_face_absence IS NULL;
GO
