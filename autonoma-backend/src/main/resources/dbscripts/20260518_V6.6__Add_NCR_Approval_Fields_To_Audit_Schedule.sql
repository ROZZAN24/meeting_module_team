-- Migration to add missing NCR approval fields to audit_schedule table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'ncr_approved_by')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [ncr_approved_by] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'ncr_approved_by_type')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [ncr_approved_by_type] NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule]') AND name = N'ncr_approved_by_details')
BEGIN
    ALTER TABLE [dbo].[audit_schedule] ADD [ncr_approved_by_details] NVARCHAR(MAX);
END
