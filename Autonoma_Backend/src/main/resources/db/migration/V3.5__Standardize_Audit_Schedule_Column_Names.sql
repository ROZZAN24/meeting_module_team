-- V3.5 Clean up and Standardize Audit Schedule Column Names
USE [AUTONOMA];

-- Function to drop column if it exists
-- SQL Server doesn't support DROP COLUMN IF EXISTS in older versions, using manual check

-- List of columns to check and potentially drop after ensuring snake_case exists
-- isDeleted -> is_deleted
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'isDeleted')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'is_deleted')
    BEGIN
        ALTER TABLE [dbo].[audit_schedules] DROP COLUMN [isDeleted];
    END
    ELSE
    BEGIN
        EXEC sp_rename 'audit_schedules.isDeleted', 'is_deleted', 'COLUMN';
    END
END

-- criteriaMinCount -> criteria_min_count
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'criteriaMinCount')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'criteria_min_count')
    BEGIN
        ALTER TABLE [dbo].[audit_schedules] DROP COLUMN [criteriaMinCount];
    END
    ELSE
    BEGIN
        EXEC sp_rename 'audit_schedules.criteriaMinCount', 'criteria_min_count', 'COLUMN';
    END
END

-- Ensure is_deleted is NOT NULL
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ALTER COLUMN [is_deleted] BIT NOT NULL;
END
ELSE
BEGIN
    ALTER TABLE [dbo].[audit_schedules] ADD [is_deleted] BIT NOT NULL DEFAULT 0;
END
