-- Create ad_user_theme_setting table for User Theme Preferences
IF OBJECT_ID('ad_user_theme_setting', 'U') IS NULL
BEGIN
    CREATE TABLE ad_user_theme_setting (
        user_id NVARCHAR(50) PRIMARY KEY,
        theme_mode NVARCHAR(20) DEFAULT 'system',
        menu_orientation NVARCHAR(20) DEFAULT 'vertical',
        mini_drawer BIT DEFAULT 0,
        font_family NVARCHAR(100) DEFAULT '''Roboto'', sans-serif',
        border_radius INT DEFAULT 8,
        outlined_filled BIT DEFAULT 1,
        preset_color NVARCHAR(50) DEFAULT 'default',
        i18n NVARCHAR(20) DEFAULT 'en',
        theme_direction NVARCHAR(20) DEFAULT 'ltr',
        container BIT DEFAULT 0,
        updated_at DATETIME DEFAULT GETDATE()
    );
END
GO
