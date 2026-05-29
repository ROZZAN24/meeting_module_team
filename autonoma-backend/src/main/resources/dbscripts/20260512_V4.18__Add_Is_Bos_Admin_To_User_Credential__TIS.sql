-- V4.18 Add IS_BOS_ADMIN to ad_user_credential / AD_USER_CREDENTIALS
IF OBJECT_ID(N'[dbo].[ad_user_credential]', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_user_credential]') AND name = 'IS_BOS_ADMIN')
    BEGIN
        ALTER TABLE [dbo].[ad_user_credential] ADD [IS_BOS_ADMIN] INT DEFAULT 0;
    END
END
ELSE IF OBJECT_ID(N'[dbo].[AD_USER_CREDENTIALS]', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_CREDENTIALS]') AND name = 'IS_BOS_ADMIN')
    BEGIN
        ALTER TABLE [dbo].[AD_USER_CREDENTIALS] ADD [IS_BOS_ADMIN] INT DEFAULT 0;
    END
END
GO

-- Update existing admin user
IF OBJECT_ID(N'[dbo].[ad_user_credential]', 'U') IS NOT NULL
BEGIN
    EXEC('UPDATE [dbo].[ad_user_credential] SET [IS_BOS_ADMIN] = 1 WHERE [user_id] = ''Admin''');
END
ELSE IF OBJECT_ID(N'[dbo].[AD_USER_CREDENTIALS]', 'U') IS NOT NULL
BEGIN
    EXEC('UPDATE [dbo].[AD_USER_CREDENTIALS] SET [IS_BOS_ADMIN] = 1 WHERE [user_id] = ''Admin''');
END
GO
