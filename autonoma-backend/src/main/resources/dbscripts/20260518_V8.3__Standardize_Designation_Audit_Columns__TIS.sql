-- V8.3 Standardize Designation Audit Columns
-- Renaming created_at/updated_at to created_date/updated_date to match platform standards.
USE [AUTONOMA];

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'created_at')
    EXEC sp_rename 'hrm_designation_master.created_at', 'created_date', 'COLUMN';

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updated_at')
    EXEC sp_rename 'hrm_designation_master.updated_at', 'updated_date', 'COLUMN';
GO
