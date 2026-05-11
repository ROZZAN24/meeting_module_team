-- V3.6 Normalize Schema and Drop Legacy camelCase Duplicates
USE [AUTONOMA];

-- Helper procedure to drop constraints before dropping columns
-- SQL Server prevents dropping columns that have Default Constraints

-- 1. TABLE: audit_schedules
-- Move data to snake_case
UPDATE audit_schedules SET schedule_no = scheduleNo WHERE schedule_no IS NULL AND scheduleNo IS NOT NULL;
UPDATE audit_schedules SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL;
UPDATE audit_schedules SET audit_area = auditArea WHERE audit_area IS NULL AND auditArea IS NOT NULL;
UPDATE audit_schedules SET audit_date = auditDate WHERE audit_date IS NULL AND auditDate IS NOT NULL;
UPDATE audit_schedules SET audit_month = auditMonth WHERE audit_month IS NULL AND auditMonth IS NOT NULL;
UPDATE audit_schedules SET start_time = startTime WHERE start_time IS NULL AND startTime IS NOT NULL;
UPDATE audit_schedules SET end_time = endTime WHERE end_time IS NULL AND endTime IS NOT NULL;
UPDATE audit_schedules SET item_code = itemCode WHERE item_code IS NULL AND itemCode IS NOT NULL;
UPDATE audit_schedules SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL;
UPDATE audit_schedules SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL;

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
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'scheduleNo') ALTER TABLE audit_schedules DROP COLUMN scheduleNo;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditType') ALTER TABLE audit_schedules DROP COLUMN auditType;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditArea') ALTER TABLE audit_schedules DROP COLUMN auditArea;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditDate') ALTER TABLE audit_schedules DROP COLUMN auditDate;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'auditMonth') ALTER TABLE audit_schedules DROP COLUMN auditMonth;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'startTime') ALTER TABLE audit_schedules DROP COLUMN startTime;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'endTime') ALTER TABLE audit_schedules DROP COLUMN endTime;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'itemCode') ALTER TABLE audit_schedules DROP COLUMN itemCode;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'createdBy') ALTER TABLE audit_schedules DROP COLUMN createdBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'createdDate') ALTER TABLE audit_schedules DROP COLUMN createdDate;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'updatedBy') ALTER TABLE audit_schedules DROP COLUMN updatedBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'updatedDate') ALTER TABLE audit_schedules DROP COLUMN updatedDate;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND name = 'scheduleDate') ALTER TABLE audit_schedules DROP COLUMN scheduleDate;


-- 2. TABLE: audit_criteria
UPDATE audit_criteria SET seq_no = seqNo WHERE seq_no IS NULL AND seqNo IS NOT NULL;
UPDATE audit_criteria SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL;
UPDATE audit_criteria SET criteria_text = criteriaText WHERE criteria_text IS NULL AND criteriaText IS NOT NULL;
UPDATE audit_criteria SET attachment_required = attachmentRequired WHERE attachment_required IS NULL AND attachmentRequired IS NOT NULL;
UPDATE audit_criteria SET attachment_info = attachmentInfo WHERE attachment_info IS NULL AND attachmentInfo IS NOT NULL;
UPDATE audit_criteria SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL;
UPDATE audit_criteria SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL;

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

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'seqNo') ALTER TABLE audit_criteria DROP COLUMN seqNo;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'auditType') ALTER TABLE audit_criteria DROP COLUMN auditType;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'criteriaText') ALTER TABLE audit_criteria DROP COLUMN criteriaText;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachmentRequired') ALTER TABLE audit_criteria DROP COLUMN attachmentRequired;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'attachmentInfo') ALTER TABLE audit_criteria DROP COLUMN attachmentInfo;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'createdBy') ALTER TABLE audit_criteria DROP COLUMN createdBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'createdDate') ALTER TABLE audit_criteria DROP COLUMN createdDate;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'updatedBy') ALTER TABLE audit_criteria DROP COLUMN updatedBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND name = 'updatedDate') ALTER TABLE audit_criteria DROP COLUMN updatedDate;


-- 3. TABLE: audit_types
UPDATE audit_types SET audit_type = auditType WHERE audit_type IS NULL AND auditType IS NOT NULL;
UPDATE audit_types SET audit_area = auditArea WHERE audit_area IS NULL AND auditArea IS NOT NULL;
UPDATE audit_types SET criteria_min_count = criteriaMinCount WHERE criteria_min_count IS NULL AND criteriaMinCount IS NOT NULL;
UPDATE audit_types SET criteria_type = criteriaType WHERE criteria_type IS NULL AND criteriaType IS NOT NULL;
UPDATE audit_types SET customer_audit_area = customerAuditArea WHERE customer_audit_area IS NULL AND customerAuditArea IS NOT NULL;
UPDATE audit_types SET created_by = createdBy WHERE created_by IS NULL AND createdBy IS NOT NULL;
UPDATE audit_types SET created_date = createdDate WHERE created_date IS NULL AND createdDate IS NOT NULL;

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

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'auditType') ALTER TABLE audit_types DROP COLUMN auditType;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'auditArea') ALTER TABLE audit_types DROP COLUMN auditArea;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaMinCount') ALTER TABLE audit_types DROP COLUMN criteriaMinCount;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'criteriaType') ALTER TABLE audit_types DROP COLUMN criteriaType;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'customerAuditArea') ALTER TABLE audit_types DROP COLUMN customerAuditArea;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'createdBy') ALTER TABLE audit_types DROP COLUMN createdBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'createdDate') ALTER TABLE audit_types DROP COLUMN createdDate;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'updatedBy') ALTER TABLE audit_types DROP COLUMN updatedBy;
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND name = 'updatedDate') ALTER TABLE audit_types DROP COLUMN updatedDate;
