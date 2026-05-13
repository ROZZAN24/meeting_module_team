-- V4.18 Add IS_BOS_ADMIN column to ad_user_credential table
USE [AUTONOMA];
GO

IF OBJECT_ID('ad_user_credential', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_user_credential]') AND name IN ('IS_BOS_ADMIN', 'is_bos_admin'))
    BEGIN
        ALTER TABLE [dbo].[ad_user_credential] ADD [IS_BOS_ADMIN] INT DEFAULT 0;
    END

    EXEC('UPDATE [dbo].[ad_user_credential] SET [IS_BOS_ADMIN] = 1 WHERE [user_id] = ''Admin'' AND [IS_BOS_ADMIN] IS NULL');
    EXEC('UPDATE [dbo].[ad_user_credential] SET [IS_BOS_ADMIN] = 0 WHERE [IS_BOS_ADMIN] IS NULL');
END
ELSE IF OBJECT_ID('AD_USER_CREDENTIALS', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_CREDENTIALS]') AND name IN ('IS_BOS_ADMIN', 'is_bos_admin'))
    BEGIN
        ALTER TABLE [dbo].[AD_USER_CREDENTIALS] ADD [IS_BOS_ADMIN] INT DEFAULT 0;
    END

    EXEC('UPDATE [dbo].[AD_USER_CREDENTIALS] SET [IS_BOS_ADMIN] = 1 WHERE [USER_ID] = ''Admin'' AND [IS_BOS_ADMIN] IS NULL');
    EXEC('UPDATE [dbo].[AD_USER_CREDENTIALS] SET [IS_BOS_ADMIN] = 0 WHERE [IS_BOS_ADMIN] IS NULL');
END
GO
