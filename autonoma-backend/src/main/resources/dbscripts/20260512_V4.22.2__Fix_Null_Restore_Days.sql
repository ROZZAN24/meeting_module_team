-- V4.22 Ensure existing company records have a default restore grace period
USE [AUTONOMA];

UPDATE [dbo].[AD_COMPANY_CREDENTIAL] SET restore_enable_days = 7 WHERE restore_enable_days IS NULL;
GO

UPDATE [dbo].[ad_audit_trail] SET is_restored = 0 WHERE is_restored IS NULL;
GO
