-- V3.9 Normalize Audit Observations Schema
USE [AUTONOMA];

-- 1. DATA MIGRATION
-- audit_observations
UPDATE [dbo].[audit_observations] SET [observation_no] = ISNULL([observation_no], [observationNo]) WHERE [observationNo] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [observation_date] = ISNULL([observation_date], [observationDate]) WHERE [observationDate] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [auditScheduleNo]) WHERE [auditScheduleNo] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [audit_type] = ISNULL([audit_type], [auditType]) WHERE [auditType] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [department_name] = ISNULL([department_name], [departmentName]) WHERE [departmentName] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [ncr_approved_by] = ISNULL([ncr_approved_by], [ncrApprovedBy]) WHERE [ncrApprovedBy] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [audit_score] = ISNULL([audit_score], [auditScore]) WHERE [auditScore] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [ofi_count] = ISNULL([ofi_count], [ofiCount]) WHERE [ofiCount] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [compliance_count] = ISNULL([compliance_count], [complianceCount]) WHERE [complianceCount] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [ncr_count] = ISNULL([ncr_count], [ncrCount]) WHERE [ncrCount] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [created_by] = ISNULL([created_by], [createdBy]) WHERE [createdBy] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [created_date] = ISNULL([created_date], [createdDate]) WHERE [createdDate] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [updated_by] = ISNULL([updated_by], [updatedBy]) WHERE [updatedBy] IS NOT NULL;
UPDATE [dbo].[audit_observations] SET [updated_date] = ISNULL([updated_date], [updatedDate]) WHERE [updatedDate] IS NOT NULL;

-- audit_observation_details
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND name = 'seq_no')
    ALTER TABLE [dbo].[audit_observation_details] ALTER COLUMN [seq_no] NVARCHAR(50);

UPDATE [dbo].[audit_observation_details] SET [seq_no] = CAST(ISNULL([seq_no], [seqNo]) AS NVARCHAR(50)) WHERE [seqNo] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [criteria_details] = ISNULL([criteria_details], [criteriaDetails]) WHERE [criteriaDetails] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [attachment_req] = ISNULL([attachment_req], [attachmentReq]) WHERE [attachmentReq] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [observation_status] = ISNULL([observation_status], [observationStatus]) WHERE [observationStatus] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [approval_status] = ISNULL([approval_status], [approvalStatus]) WHERE [approvalStatus] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [observation_id] = ISNULL([observation_id], [observationId]) WHERE [observationId] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [closed_by] = ISNULL([closed_by], [closedBy]) WHERE [closedBy] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [closed_date] = ISNULL([closed_date], [closedDate]) WHERE [closedDate] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [corrective_action] = ISNULL([corrective_action], [correctiveAction]) WHERE [correctiveAction] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [ncr_status] = ISNULL([ncr_status], [ncrStatus]) WHERE [ncrStatus] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [preventive_action] = ISNULL([preventive_action], [preventiveAction]) WHERE [preventiveAction] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [root_cause] = ISNULL([root_cause], [rootCause]) WHERE [rootCause] IS NOT NULL;
UPDATE [dbo].[audit_observation_details] SET [target_date] = ISNULL([target_date], [targetDate]) WHERE [targetDate] IS NOT NULL;

-- audit_attendance
UPDATE [dbo].[audit_attendance] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [auditScheduleNo]) WHERE [auditScheduleNo] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [audit_schedule_no] = ISNULL([audit_schedule_no], [scheduleNo]) WHERE [scheduleNo] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [name] = ISNULL([name], [employeeName]) WHERE [employeeName] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [in_time] = ISNULL([in_time], [inTime]) WHERE [inTime] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [out_time] = ISNULL([out_time], [outTime]) WHERE [outTime] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [attendance_status] = ISNULL([attendance_status], [attendanceStatus]) WHERE [attendanceStatus] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [created_by] = ISNULL([created_by], [createdBy]) WHERE [createdBy] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [created_date] = ISNULL([created_date], [createdDate]) WHERE [createdDate] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [updated_by] = ISNULL([updated_by], [updatedBy]) WHERE [updatedBy] IS NOT NULL;
UPDATE [dbo].[audit_attendance] SET [updated_date] = ISNULL([updated_date], [updatedDate]) WHERE [updatedDate] IS NOT NULL;

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
SELECT @SQL += 'ALTER TABLE [dbo].[audit_observations] DROP COLUMN ' + QUOTENAME(name) + ';'
FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]')
AND name IN ('observationNo', 'observationDate', 'auditScheduleNo', 'auditType', 'departmentName', 'ncrApprovedBy', 'auditScore', 'ofiCount', 'complianceCount', 'ncrCount', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate');

-- audit_observation_details
SELECT @SQL += 'ALTER TABLE [dbo].[audit_observation_details] DROP COLUMN ' + QUOTENAME(name) + ';'
FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]')
AND name IN ('observationId', 'seqNo', 'criteriaDetails', 'attachmentReq', 'observationStatus', 'approvalStatus', 'closedBy', 'closedDate', 'correctiveAction', 'ncrStatus', 'preventiveAction', 'rootCause', 'targetDate');

-- audit_attendance
SELECT @SQL += 'ALTER TABLE [dbo].[audit_attendance] DROP COLUMN ' + QUOTENAME(name) + ';'
FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]')
AND name IN ('scheduleNo', 'employeeName', 'employeeId', 'inTime', 'outTime', 'attendanceStatus', 'remarks', 'createdBy', 'createdDate', 'auditScheduleNo', 'updatedBy', 'updatedDate');

IF @SQL <> '' EXEC sp_executesql @SQL;
