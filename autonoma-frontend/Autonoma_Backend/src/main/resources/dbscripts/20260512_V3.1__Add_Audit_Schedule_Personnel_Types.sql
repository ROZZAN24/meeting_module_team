-- Add personnel type columns to audit_schedules table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditorType')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [auditorType] NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditeeType')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [auditeeType] NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'ncrApprovedByType')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [ncrApprovedByType] NVARCHAR(255) NULL;
END
