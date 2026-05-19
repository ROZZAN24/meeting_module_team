-- Migration for Face ID Login configurations
ALTER TABLE ad_user_credential ADD face_image NVARCHAR(MAX) NULL;
ALTER TABLE ad_user_credential ADD auth_method NVARCHAR(50) DEFAULT 'PASSWORD';
ALTER TABLE ad_user_theme_setting ADD face_login_enabled BIT DEFAULT 0;
