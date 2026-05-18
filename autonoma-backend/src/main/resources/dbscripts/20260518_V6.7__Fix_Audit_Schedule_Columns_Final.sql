-- Migration to fix missing columns in audit_schedule table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'schedule_date')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [schedule_date] DATE;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'updated_at')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [updated_at] DATETIME;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'updated_by')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [updated_by] NVARCHAR(255);
END

-- Ensure NCR columns are correctly named (case-insensitive check but explicit add)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'ncr_approved_by')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [ncr_approved_by] NVARCHAR(255);
END
