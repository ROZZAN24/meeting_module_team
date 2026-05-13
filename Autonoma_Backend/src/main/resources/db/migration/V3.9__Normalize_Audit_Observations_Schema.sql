-- V3.9 Normalize Audit Observations Schema
USE [AUTONOMA];

-- 1. DATA MIGRATION
-- audit_observations
-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'observation_no') ALTER TABLE [audit_observations] ADD [observation_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'observation_date') ALTER TABLE [audit_observations] ADD [observation_date] DATE;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'audit_schedule_no') ALTER TABLE [audit_observations] ADD [audit_schedule_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'audit_type') ALTER TABLE [audit_observations] ADD [audit_type] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'department_name') ALTER TABLE [audit_observations] ADD [department_name] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ncr_approved_by') ALTER TABLE [audit_observations] ADD [ncr_approved_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'audit_score') ALTER TABLE [audit_observations] ADD [audit_score] INT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ofi_count') ALTER TABLE [audit_observations] ADD [ofi_count] INT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'compliance_count') ALTER TABLE [audit_observations] ADD [compliance_count] INT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ncr_count') ALTER TABLE [audit_observations] ADD [ncr_count] INT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'created_by') ALTER TABLE [audit_observations] ADD [created_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'created_date') ALTER TABLE [audit_observations] ADD [created_date] DATETIME;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'updated_by') ALTER TABLE [audit_observations] ADD [updated_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'updated_date') ALTER TABLE [audit_observations] ADD [updated_date] DATETIME;

IF COL_LENGTH('[dbo].[audit_observations]', 'observation_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'observationNo') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [observation_no] = ISNULL([observation_no], [observationNo]) WHERE [observationNo] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'observation_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'observationDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [observation_date] = ISNULL([observation_date], [observationDate]) WHERE [observationDate] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'audit_schedule_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'auditScheduleNo') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [auditScheduleNo]) WHERE [auditScheduleNo] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'audit_type') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'auditType') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [audit_type] = ISNULL([audit_type], [auditType]) WHERE [auditType] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'department_name') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'departmentName') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [department_name] = ISNULL([department_name], [departmentName]) WHERE [departmentName] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'ncr_approved_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'ncrApprovedBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [ncr_approved_by] = ISNULL([ncr_approved_by], [ncrApprovedBy]) WHERE [ncrApprovedBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'audit_score') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'auditScore') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [audit_score] = ISNULL([audit_score], [auditScore]) WHERE [auditScore] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'ofi_count') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'ofiCount') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [ofi_count] = ISNULL([ofi_count], [ofiCount]) WHERE [ofiCount] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'compliance_count') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'complianceCount') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [compliance_count] = ISNULL([compliance_count], [complianceCount]) WHERE [complianceCount] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'ncr_count') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'ncrCount') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [ncr_count] = ISNULL([ncr_count], [ncrCount]) WHERE [ncrCount] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'created_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'createdBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [created_by] = ISNULL([created_by], [createdBy]) WHERE [createdBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'created_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'createdDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [created_date] = ISNULL([created_date], [createdDate]) WHERE [createdDate] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'updated_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'updatedBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [updated_by] = ISNULL([updated_by], [updatedBy]) WHERE [updatedBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observations]', 'updated_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observations]', 'updatedDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_observations] SET [updated_date] = ISNULL([updated_date], [updatedDate]) WHERE [updatedDate] IS NOT NULL');

-- audit_observation_details
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'seq_no')
    EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] ALTER COLUMN [seq_no] NVARCHAR(50)';

-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'seq_no') ALTER TABLE [audit_observation_details] ADD [seq_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'criteria_details') ALTER TABLE [audit_observation_details] ADD [criteria_details] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'attachment_req') ALTER TABLE [audit_observation_details] ADD [attachment_req] NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'observation_status') ALTER TABLE [audit_observation_details] ADD [observation_status] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'approval_status') ALTER TABLE [audit_observation_details] ADD [approval_status] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'observation_id') ALTER TABLE [audit_observation_details] ADD [observation_id] BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'closed_by') ALTER TABLE [audit_observation_details] ADD [closed_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'closed_date') ALTER TABLE [audit_observation_details] ADD [closed_date] DATETIME;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'corrective_action') ALTER TABLE [audit_observation_details] ADD [corrective_action] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'ncr_status') ALTER TABLE [audit_observation_details] ADD [ncr_status] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'preventive_action') ALTER TABLE [audit_observation_details] ADD [preventive_action] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'root_cause') ALTER TABLE [audit_observation_details] ADD [root_cause] NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'target_date') ALTER TABLE [audit_observation_details] ADD [target_date] DATE;

IF COL_LENGTH('[dbo].[audit_observation_details]', 'seq_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'seqNo') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [seq_no] = CAST(ISNULL([seq_no], [seqNo]) AS NVARCHAR(50)) WHERE [seqNo] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'criteria_details') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'criteriaDetails') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [criteria_details] = ISNULL([criteria_details], [criteriaDetails]) WHERE [criteriaDetails] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'attachment_req') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'attachmentReq') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [attachment_req] = ISNULL([attachment_req], [attachmentReq]) WHERE [attachmentReq] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'observation_status') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'observationStatus') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [observation_status] = ISNULL([observation_status], [observationStatus]) WHERE [observationStatus] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'approval_status') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'approvalStatus') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [approval_status] = ISNULL([approval_status], [approvalStatus]) WHERE [approvalStatus] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'observation_id') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'observationId') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [observation_id] = ISNULL([observation_id], [observationId]) WHERE [observationId] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'closed_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'closedBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [closed_by] = ISNULL([closed_by], [closedBy]) WHERE [closedBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'closed_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'closedDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [closed_date] = ISNULL([closed_date], [closedDate]) WHERE [closedDate] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'corrective_action') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'correctiveAction') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [corrective_action] = ISNULL([corrective_action], [correctiveAction]) WHERE [correctiveAction] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'ncr_status') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'ncrStatus') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [ncr_status] = ISNULL([ncr_status], [ncrStatus]) WHERE [ncrStatus] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'preventive_action') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'preventiveAction') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [preventive_action] = ISNULL([preventive_action], [preventiveAction]) WHERE [preventiveAction] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'root_cause') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'rootCause') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [root_cause] = ISNULL([root_cause], [rootCause]) WHERE [rootCause] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_observation_details]', 'target_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_observation_details]', 'targetDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_observation_details] SET [target_date] = ISNULL([target_date], [targetDate]) WHERE [targetDate] IS NOT NULL');

-- audit_attendance
-- Ensure snake_case columns exist before updating
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'audit_schedule_no') ALTER TABLE [audit_attendance] ADD [audit_schedule_no] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'name') ALTER TABLE [audit_attendance] ADD [name] NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'in_time') ALTER TABLE [audit_attendance] ADD [in_time] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'out_time') ALTER TABLE [audit_attendance] ADD [out_time] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'attendance_status') ALTER TABLE [audit_attendance] ADD [attendance_status] NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'created_by') ALTER TABLE [audit_attendance] ADD [created_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'created_date') ALTER TABLE [audit_attendance] ADD [created_date] DATETIME;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'updated_by') ALTER TABLE [audit_attendance] ADD [updated_by] NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'updated_date') ALTER TABLE [audit_attendance] ADD [updated_date] DATETIME;

IF COL_LENGTH('[dbo].[audit_attendance]', 'audit_schedule_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'auditScheduleNo') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [auditScheduleNo]) WHERE [auditScheduleNo] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'audit_schedule_no') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'scheduleNo') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [scheduleNo]) WHERE [scheduleNo] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'name') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'employeeName') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [name] = ISNULL([name], [employeeName]) WHERE [employeeName] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'in_time') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'inTime') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [in_time] = ISNULL([in_time], [inTime]) WHERE [inTime] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'out_time') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'outTime') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [out_time] = ISNULL([out_time], [outTime]) WHERE [outTime] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'attendance_status') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'attendanceStatus') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [attendance_status] = ISNULL([attendance_status], [attendanceStatus]) WHERE [attendanceStatus] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'created_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'createdBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [created_by] = ISNULL([created_by], [createdBy]) WHERE [createdBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'created_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'createdDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [created_date] = ISNULL([created_date], [createdDate]) WHERE [createdDate] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'updated_by') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'updatedBy') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [updated_by] = ISNULL([updated_by], [updatedBy]) WHERE [updatedBy] IS NOT NULL');
IF COL_LENGTH('[dbo].[audit_attendance]', 'updated_date') IS NOT NULL AND COL_LENGTH('[dbo].[audit_attendance]', 'updatedDate') IS NOT NULL EXEC('UPDATE [dbo].[audit_attendance] SET [updated_date] = ISNULL([updated_date], [updatedDate]) WHERE [updatedDate] IS NOT NULL');

-- 2. DROP DEPENDENCIES (Constraints and Foreign Keys)
DECLARE @SQL NVARCHAR(MAX) = '';

-- Drop Default Constraints
SELECT @SQL += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(d.name) + ';'
FROM sys.default_constraints d
INNER JOIN sys.tables t ON d.parent_object_id = t.object_id
INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
WHERE t.name IN ('audit_observations', 'audit_observation_details', 'audit_attendance')
AND c.name IN ('observationNo', 'observationDate', 'auditScheduleNo', 'auditType', 'departmentName', 'ncrApprovedBy', 'auditScore', 'ofiCount', 'complianceCount', 'ncrCount', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate', 'observationId', 'seqNo', 'criteriaDetails', 'attachmentReq', 'observationStatus', 'approvalStatus', 'closedBy', 'closedDate', 'correctiveAction', 'ncrStatus', 'preventiveAction', 'rootCause', 'targetDate', 'scheduleNo', 'employeeName', 'employeeId', 'inTime', 'outTime', 'attendanceStatus', 'remarks', 'auditScheduleNo');

-- Drop Foreign Keys
SELECT @SQL += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(t.schema_id)) + '.' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';'
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns c ON fkc.parent_column_id = c.column_id AND fkc.parent_object_id = c.object_id
WHERE t.name IN ('audit_observations', 'audit_observation_details', 'audit_attendance')
AND c.name IN ('observationNo', 'observationDate', 'auditScheduleNo', 'auditType', 'departmentName', 'ncrApprovedBy', 'auditScore', 'ofiCount', 'complianceCount', 'ncrCount', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate', 'observationId', 'seqNo', 'criteriaDetails', 'attachmentReq', 'observationStatus', 'approvalStatus', 'closedBy', 'closedDate', 'correctiveAction', 'ncrStatus', 'preventiveAction', 'rootCause', 'targetDate', 'scheduleNo', 'employeeName', 'employeeId', 'inTime', 'outTime', 'attendanceStatus', 'remarks', 'auditScheduleNo');

IF @SQL <> '' EXEC sp_executesql @SQL;

-- 3. DROP COLUMNS
SET @SQL = '';

-- audit_observations
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'observationNo') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [observationNo]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'observationDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [observationDate]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'auditScheduleNo') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [auditScheduleNo]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'auditType') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [auditType]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'departmentName') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [departmentName]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ncrApprovedBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [ncrApprovedBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'auditScore') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [auditScore]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ofiCount') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [ofiCount]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'complianceCount') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [complianceCount]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'ncrCount') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [ncrCount]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'createdBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [createdBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'createdDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [createdDate]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'updatedBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [updatedBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND name = 'updatedDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observations] DROP COLUMN [updatedDate]';

-- audit_observation_details
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'observationId') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [observationId]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'seqNo') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [seqNo]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'criteriaDetails') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [criteriaDetails]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'attachmentReq') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [attachmentReq]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'observationStatus') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [observationStatus]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'approvalStatus') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [approvalStatus]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'closedBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [closedBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'closedDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [closedDate]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'correctiveAction') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [correctiveAction]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'ncrStatus') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [ncrStatus]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'preventiveAction') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [preventiveAction]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'rootCause') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [rootCause]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'targetDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN [targetDate]';

-- audit_attendance
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'scheduleNo') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [scheduleNo]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employeeName') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [employeeName]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'employeeId') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [employeeId]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'inTime') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [inTime]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'outTime') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [outTime]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'attendanceStatus') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [attendanceStatus]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'remarks') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [remarks]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'createdBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [createdBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'createdDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [createdDate]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'auditScheduleNo') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [auditScheduleNo]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'updatedBy') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [updatedBy]';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND name = 'updatedDate') EXEC sp_executesql N'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN [updatedDate]';

IF @SQL <> '' EXEC sp_executesql @SQL;
