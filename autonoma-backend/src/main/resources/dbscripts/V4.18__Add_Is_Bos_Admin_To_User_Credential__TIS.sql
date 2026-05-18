-- V4.18 Add IS_BOS_ADMIN to ad_user_credential
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_user_credential]') AND name = 'IS_BOS_ADMIN')
BEGIN
    ALTER TABLE [dbo].[ad_user_credential] ADD [IS_BOS_ADMIN] INT DEFAULT 0;
END
GO

-- Update existing admin user
UPDATE [dbo].[ad_user_credential] SET [IS_BOS_ADMIN] = 1 WHERE [user_id] = 'Admin';
GO
