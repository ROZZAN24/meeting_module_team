-- Add dashboard_layout column to ad_user_theme_setting
-- Stores the preferred dashboard UI layout for the user task queue
-- Values: 'glass' (glassmorphism - new design), 'classic' (legacy design)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'ad_user_theme_setting' AND COLUMN_NAME = 'dashboard_layout'
)
BEGIN
    ALTER TABLE ad_user_theme_setting
    ADD dashboard_layout NVARCHAR(20) DEFAULT 'glass';
END
GO
