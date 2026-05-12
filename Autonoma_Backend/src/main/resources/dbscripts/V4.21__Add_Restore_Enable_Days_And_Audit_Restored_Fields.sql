-- V4.21 Add Restore Enable Days and Audit Restoration Tracking Fields
USE [AUTONOMA];

-- Add restore_enable_days to Company Credentials
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AD_COMPANY_CREDENTIAL]') AND name = 'restore_enable_days')
BEGIN
    ALTER TABLE [dbo].[AD_COMPANY_CREDENTIAL] ADD restore_enable_days BIGINT DEFAULT 7;
END
GO

-- Add restoration tracking fields to Audit Trail
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_audit_trail]') AND name = 'is_restored')
BEGIN
    ALTER TABLE [dbo].[ad_audit_trail] ADD is_restored BIT DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ad_audit_trail]') AND name = 'restored_at')
BEGIN
    ALTER TABLE [dbo].[ad_audit_trail] ADD restored_at DATETIME;
END
GO
