-- V67.0 Rename IS_BOS_ADMIN to USER_LEVEL in AD_USER_CREDENTIAL table

-- 1. Rename the column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_CREDENTIAL]') AND name = 'IS_BOS_ADMIN')
BEGIN
    EXEC sp_rename 'dbo.AD_USER_CREDENTIAL.IS_BOS_ADMIN', 'USER_LEVEL', 'COLUMN';
END
GO

-- 2. Update existing Super Users (1) to Boss Admin (5)
-- We only update if the value is 1. If there are other values, we leave them alone.
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_USER_CREDENTIAL]') AND name = 'USER_LEVEL')
BEGIN
    EXEC('UPDATE [dbo].[AD_USER_CREDENTIAL] SET [USER_LEVEL] = 5 WHERE [USER_LEVEL] = 1 AND LOWER([USER_ID]) = ''admin''');
END
GO
