-- V4.7 Final Audit Schema Normalization
USE [AUTONOMA];

-- Ensure audit_observation table columns are standardized
IF COL_LENGTH('audit_observation', 'AuditArea') IS NOT NULL EXEC sp_rename 'audit_observation.AuditArea', 'audit_area', 'COLUMN';
IF COL_LENGTH('audit_observation', 'auditArea') IS NOT NULL EXEC sp_rename 'audit_observation.auditArea', 'audit_area', 'COLUMN';

IF COL_LENGTH('audit_observation', 'AuditScheduleNo') IS NOT NULL EXEC sp_rename 'audit_observation.AuditScheduleNo', 'audit_schedule_no', 'COLUMN';
IF COL_LENGTH('audit_observation', 'auditScheduleNo') IS NOT NULL EXEC sp_rename 'audit_observation.auditScheduleNo', 'audit_schedule_no', 'COLUMN';

IF COL_LENGTH('audit_observation', 'AuditType') IS NOT NULL EXEC sp_rename 'audit_observation.AuditType', 'audit_type', 'COLUMN';
IF COL_LENGTH('audit_observation', 'auditType') IS NOT NULL EXEC sp_rename 'audit_observation.auditType', 'audit_type', 'COLUMN';

IF COL_LENGTH('audit_observation', 'DepartmentName') IS NOT NULL EXEC sp_rename 'audit_observation.DepartmentName', 'department_name', 'COLUMN';
IF COL_LENGTH('audit_observation', 'departmentName') IS NOT NULL EXEC sp_rename 'audit_observation.departmentName', 'department_name', 'COLUMN';

IF COL_LENGTH('audit_observation', 'ObservationNo') IS NOT NULL EXEC sp_rename 'audit_observation.ObservationNo', 'observation_no', 'COLUMN';
IF COL_LENGTH('audit_observation', 'observationNo') IS NOT NULL EXEC sp_rename 'audit_observation.observationNo', 'observation_no', 'COLUMN';

IF COL_LENGTH('audit_observation', 'ObservationDate') IS NOT NULL EXEC sp_rename 'audit_observation.ObservationDate', 'observation_date', 'COLUMN';
IF COL_LENGTH('audit_observation', 'observationDate') IS NOT NULL EXEC sp_rename 'audit_observation.observationDate', 'observation_date', 'COLUMN';

-- Ensure audit_observation_detail columns
IF COL_LENGTH('audit_observation_detail', 'ObservationId') IS NOT NULL EXEC sp_rename 'audit_observation_detail.ObservationId', 'observation_id', 'COLUMN';
IF COL_LENGTH('audit_observation_detail', 'observationId') IS NOT NULL EXEC sp_rename 'audit_observation_detail.observationId', 'observation_id', 'COLUMN';

-- Also fix any potential discrepancies in audit_schedule
IF COL_LENGTH('audit_schedule', 'AuditArea') IS NOT NULL EXEC sp_rename 'audit_schedule.AuditArea', 'audit_area', 'COLUMN';
IF COL_LENGTH('audit_schedule', 'auditArea') IS NOT NULL EXEC sp_rename 'audit_schedule.auditArea', 'audit_area', 'COLUMN';

-- Create audit_area column if it really doesn't exist (emergency fallback)
IF COL_LENGTH('audit_observation', 'audit_area') IS NULL
BEGIN
    ALTER TABLE audit_observation ADD audit_area NVARCHAR(255);
END
