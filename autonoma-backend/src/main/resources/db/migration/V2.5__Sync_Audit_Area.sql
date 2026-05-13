-- Sync audit_areas table with Java Entity
-- Adding type and description columns, and making auditArea nullable

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_areas]') AND name = 'type')
BEGIN
    ALTER TABLE [dbo].[audit_areas] ADD [type] NVARCHAR(50);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_areas]') AND name = 'description')
BEGIN
    ALTER TABLE [dbo].[audit_areas] ADD [description] NVARCHAR(MAX);
END

-- Make auditArea nullable as it's not being sent by the new frontend logic
ALTER TABLE [dbo].[audit_areas] ALTER COLUMN [auditArea] NVARCHAR(255) NULL;
