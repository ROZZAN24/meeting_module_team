-- Migration for Face ID Login configurations
IF COL_LENGTH('ad_user_credential', 'face_image') IS NULL
BEGIN
    ALTER TABLE ad_user_credential ADD face_image NVARCHAR(MAX) NULL;
END

IF COL_LENGTH('ad_user_credential', 'auth_method') IS NULL
BEGIN
    ALTER TABLE ad_user_credential ADD auth_method NVARCHAR(50) DEFAULT 'PASSWORD';
END

IF COL_LENGTH('ad_user_theme_setting', 'face_login_enabled') IS NULL
BEGIN
    ALTER TABLE ad_user_theme_setting ADD face_login_enabled BIT DEFAULT 0;
END
