-- V3.7 Standardize Remaining Audit Schedule Columns
USE [AUTONOMA];

-- TABLE: audit_schedules
-- 1. auditee_type
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditee_type')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditeeType')
        EXEC sp_rename 'audit_schedules.auditeeType', 'auditee_type', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [auditee_type] NVARCHAR(255);
END

-- 2. auditor_type
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditor_type')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditorType')
        EXEC sp_rename 'audit_schedules.auditorType', 'auditor_type', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [auditor_type] NVARCHAR(255);
END

-- 3. ncr_approved_by_type
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'ncr_approved_by_type')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'ncrApprovedByType')
        EXEC sp_rename 'audit_schedules.ncrApprovedByType', 'ncr_approved_by_type', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [ncr_approved_by_type] NVARCHAR(255);
END

-- 4. auditor_details
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditor_details')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditorDetails')
        EXEC sp_rename 'audit_schedules.auditorDetails', 'auditor_details', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [auditor_details] NVARCHAR(MAX);
END

-- 5. auditee_details
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditee_details')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditeeDetails')
        EXEC sp_rename 'audit_schedules.auditeeDetails', 'auditee_details', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [auditee_details] NVARCHAR(MAX);
END

-- 6. ncr_approved_by_details
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'ncr_approved_by_details')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'ncrApprovedByDetails')
        EXEC sp_rename 'audit_schedules.ncrApprovedByDetails', 'ncr_approved_by_details', 'COLUMN';
    ELSE
        ALTER TABLE [dbo].[audit_schedules] ADD [ncr_approved_by_details] NVARCHAR(MAX);
END
