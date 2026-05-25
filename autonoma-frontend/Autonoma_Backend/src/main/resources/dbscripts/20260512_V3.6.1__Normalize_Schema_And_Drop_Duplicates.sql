-- V3.6 Normalize Schema and Drop Legacy camelCase Duplicates
USE [AUTONOMA];

-- Helper procedure to drop constraints before dropping columns
-- SQL Server prevents dropping columns that have Default Constraints

-- 1. TABLE: audit_schedules
-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'schedule_no') ALTER TABLE [audit_schedules] ADD [schedule_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'audit_type') ALTER TABLE [audit_schedules] ADD [audit_type] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'audit_area') ALTER TABLE [audit_schedules] ADD [audit_area] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'audit_date') ALTER TABLE [audit_schedules] ADD [audit_date] DATE;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'audit_month') ALTER TABLE [audit_schedules] ADD [audit_month] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'start_time') ALTER TABLE [audit_schedules] ADD [start_time] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'end_time') ALTER TABLE [audit_schedules] ADD [end_time] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'item_code') ALTER TABLE [audit_schedules] ADD [item_code] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'created_by') ALTER TABLE [audit_schedules] ADD [created_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'created_date') ALTER TABLE [audit_schedules] ADD [created_date] DATETIME;

-- Move data to snake_case
IF COL_LENGTH('[dbo].[audit_schedules]', 'schedule_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'scheduleNo') IS NOT NULL EXEC('UPDATE audit_schedules SET schedule_no = scheduleNo WHERE schedule_no IS NULL AND scheduleNo IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'audit_type') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'auditType') IS NOT NULL EXEC('UPDATE audit_schedules SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'audit_area') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'auditArea') IS NOT NULL EXEC('UPDATE audit_schedules SET audit_area = auditArea WHERE audit_area IS NULL AND auditArea IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'audit_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'auditDate') IS NOT NULL EXEC('UPDATE audit_schedules SET audit_date = auditDate WHERE audit_date IS NULL AND auditDate IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'audit_month') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'auditMonth') IS NOT NULL EXEC('UPDATE audit_schedules SET audit_month = auditMonth WHERE audit_month IS NULL AND auditMonth IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'start_time') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'startTime') IS NOT NULL EXEC('UPDATE audit_schedules SET start_time = startTime WHERE start_time IS NULL AND startTime IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'end_time') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'endTime') IS NOT NULL EXEC('UPDATE audit_schedules SET end_time = endTime WHERE end_time IS NULL AND endTime IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'item_code') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'itemCode') IS NOT NULL EXEC('UPDATE audit_schedules SET item_code = itemCode WHERE item_code IS NULL AND itemCode IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'created_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'createdBy') IS NOT NULL EXEC('UPDATE audit_schedules SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_schedules]', 'created_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_schedules]', 'createdDate') IS NOT NULL EXEC('UPDATE audit_schedules SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL');

-- Drop constraints for audit_schedules
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'ALTER TABLE [audit_schedules] DROP CONSTRAINT ' + name + ';'
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('audit_schedules')
AND parent_column_id IN (
    SELECT column_id FROM sys.columns 
    WHERE object_id = OBJECT_ID('audit_schedules') 
    AND name IN ('scheduleNo', 'auditType', 'auditArea', 'auditDate', 'auditMonth', 'startTime', 'endTime', 'itemCode', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate', 'scheduleDate')
);
EXEC sp_executesql @sql;

-- Drop columns for audit_schedules
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'scheduleNo') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN scheduleNo';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditType') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN auditType';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditArea') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN auditArea';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditDate') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN auditDate';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditMonth') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN auditMonth';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'startTime') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN startTime';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'endTime') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN endTime';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'itemCode') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN itemCode';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'createdBy') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN createdBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'createdDate') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN createdDate';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'updatedBy') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN updatedBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'updatedDate') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN updatedDate';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'scheduleDate') EXEC sp_executesql N'ALTER TABLE audit_schedules DROP COLUMN scheduleDate';


-- 2. TABLE: audit_criteria
-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'seq_no') ALTER TABLE [audit_criteria] ADD [seq_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'audit_type') ALTER TABLE [audit_criteria] ADD [audit_type] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'criteria_text') ALTER TABLE [audit_criteria] ADD [criteria_text] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachment_required') ALTER TABLE [audit_criteria] ADD [attachment_required] NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachment_info') ALTER TABLE [audit_criteria] ADD [attachment_info] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'created_by') ALTER TABLE [audit_criteria] ADD [created_by] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'created_date') ALTER TABLE [audit_criteria] ADD [created_date] DATETIME;

IF COL_LENGTH('[dbo].[audit_criteria]', 'seq_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'seqNo') IS NOT NULL EXEC('UPDATE audit_criteria SET seq_no = seqNo WHERE seq_no IS NULL AND seqNo IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'audit_type') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'auditType') IS NOT NULL EXEC('UPDATE audit_criteria SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'criteria_text') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'criteriaText') IS NOT NULL EXEC('UPDATE audit_criteria SET criteria_text = criteriaText WHERE criteria_text IS NULL AND criteriaText IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'attachment_required') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'attachmentRequired') IS NOT NULL EXEC('UPDATE audit_criteria SET attachment_required = attachmentRequired WHERE attachment_required IS NULL AND attachmentRequired IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'attachment_info') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'attachmentInfo') IS NOT NULL EXEC('UPDATE audit_criteria SET attachment_info = attachmentInfo WHERE attachment_info IS NULL AND attachmentInfo IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'created_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'createdBy') IS NOT NULL EXEC('UPDATE audit_criteria SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_criteria]', 'created_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_criteria]', 'createdDate') IS NOT NULL EXEC('UPDATE audit_criteria SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL');

-- Drop constraints for audit_criteria
SET @sql = '';
SELECT @sql += 'ALTER TABLE [audit_criteria] DROP CONSTRAINT ' + name + ';'
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('audit_criteria')
AND parent_column_id IN (
    SELECT column_id FROM sys.columns 
    WHERE object_id = OBJECT_ID('audit_criteria') 
    AND name IN ('seqNo', 'auditType', 'criteriaText', 'attachmentRequired', 'attachmentInfo', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate')
);
EXEC sp_executesql @sql;

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'seqNo') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN seqNo';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'auditType') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN auditType';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'criteriaText') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN criteriaText';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachmentRequired') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN attachmentRequired';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachmentInfo') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN attachmentInfo';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'createdBy') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN createdBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'createdDate') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN createdDate';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'updatedBy') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN updatedBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'updatedDate') EXEC sp_executesql N'ALTER TABLE audit_criteria DROP COLUMN updatedDate';


-- 3. TABLE: audit_types
-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'audit_type') ALTER TABLE [audit_types] ADD [audit_type] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'audit_area') ALTER TABLE [audit_types] ADD [audit_area] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteria_min_count') ALTER TABLE [audit_types] ADD [criteria_min_count] INT DEFAULT 0;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteria_type') ALTER TABLE [audit_types] ADD [criteria_type] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'customer_audit_area') ALTER TABLE [audit_types] ADD [customer_audit_area] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'created_by') ALTER TABLE [audit_types] ADD [created_by] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'created_date') ALTER TABLE [audit_types] ADD [created_date] DATETIME;

IF COL_LENGTH('[dbo].[audit_types]', 'audit_type') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'auditType') IS NOT NULL EXEC('UPDATE audit_types SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'audit_area') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'auditArea') IS NOT NULL EXEC('UPDATE audit_types SET audit_area = auditArea WHERE audit_area IS NULL AND auditArea IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'criteria_min_count') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'criteriaMinCount') IS NOT NULL EXEC('UPDATE audit_types SET criteria_min_count = criteriaMinCount WHERE criteria_min_count IS NULL AND criteriaMinCount IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'criteria_type') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'criteriaType') IS NOT NULL EXEC('UPDATE audit_types SET criteria_type = criteriaType WHERE criteria_type IS NULL AND criteriaType IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'customer_audit_area') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'customerAuditArea') IS NOT NULL EXEC('UPDATE audit_types SET customer_audit_area = customerAuditArea WHERE customer_audit_area IS NULL AND customerAuditArea IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'created_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'createdBy') IS NOT NULL EXEC('UPDATE audit_types SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_types]', 'created_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_types]', 'createdDate') IS NOT NULL EXEC('UPDATE audit_types SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL');

-- Drop constraints for audit_types
SET @sql = '';
SELECT @sql += 'ALTER TABLE [audit_types] DROP CONSTRAINT ' + name + ';'
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('audit_types')
AND parent_column_id IN (
    SELECT column_id FROM sys.columns 
    WHERE object_id = OBJECT_ID('audit_types') 
    AND name IN ('auditType', 'auditArea', 'criteriaMinCount', 'criteriaType', 'customerAuditArea', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate')
);
EXEC sp_executesql @sql;

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'auditType') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN auditType';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'auditArea') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN auditArea';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaMinCount') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN criteriaMinCount';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaType') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN criteriaType';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'customerAuditArea') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN customerAuditArea';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'createdBy') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN createdBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'createdDate') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN createdDate';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'updatedBy') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN updatedBy';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'updatedDate') EXEC sp_executesql N'ALTER TABLE audit_types DROP COLUMN updatedDate';
