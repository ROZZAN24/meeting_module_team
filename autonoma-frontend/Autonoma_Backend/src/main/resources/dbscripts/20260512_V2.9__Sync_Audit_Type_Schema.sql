-- V2.9 Sync Audit Type Schema
-- Add missing columns to audit_types
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'standard')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [standard] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'description')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [description] NVARCHAR(MAX);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaMinCount')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [criteriaMinCount] INT DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'customerAuditArea')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [customerAuditArea] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'auditArea')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [auditArea] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaType')
BEGIN
    ALTER TABLE [dbo].[audit_types] ADD [criteriaType] NVARCHAR(100);
END

-- Fix seqNo type in audit_schedule_criteria to match Java Integer
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule_criteria]') AND name = 'seqNo' AND system_type_id != 56) -- 56 is INT
BEGIN
    ALTER TABLE [dbo].[audit_schedule_criteria] ALTER COLUMN [seqNo] INT;
END
