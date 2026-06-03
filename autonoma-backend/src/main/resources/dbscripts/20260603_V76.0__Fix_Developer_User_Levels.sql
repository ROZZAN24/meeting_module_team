-- V76.0 Revert non-Admin users from level 5 (Boss Admin) to level 1 (Admin User)
-- The V70 migration mistakenly updated all user levels from 1 to 5, locking developer accounts.

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_CREDENTIAL]') AND name = 'USER_LEVEL')
BEGIN
    EXEC('UPDATE [dbo].[AD_USER_CREDENTIAL] SET [USER_LEVEL] = 1 WHERE [USER_LEVEL] = 5 AND LOWER([USER_ID]) <> ''admin''');
END
GO
