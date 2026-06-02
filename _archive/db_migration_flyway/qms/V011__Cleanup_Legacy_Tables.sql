-- V011__Cleanup_Legacy_Tables.sql
-- Safely drop legacy/obsolete tables that have been renamed and standardized

-- 1. Drop foreign keys referencing legacy tables if any to prevent locking
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys
WHERE OBJECT_NAME(referenced_object_id) IN (
    'EmployeeMaster', 'HRM_EMPLOYEE_MASTER', 'PRODUCT_MASTER', 'SM_CUSTOMER_MASTER', 'SM_VENDOR_MASTER', 'STATUS_MASTER',
    'audit_areas', 'audit_attendance', 'audit_criteria', 'audit_observation_details', 'audit_observations', 'audit_schedule_criteria', 'audit_schedules', 'audit_types'
) OR OBJECT_NAME(parent_object_id) IN (
    'EmployeeMaster', 'HRM_EMPLOYEE_MASTER', 'PRODUCT_MASTER', 'SM_CUSTOMER_MASTER', 'SM_VENDOR_MASTER', 'STATUS_MASTER',
    'audit_areas', 'audit_attendance', 'audit_criteria', 'audit_observation_details', 'audit_observations', 'audit_schedule_criteria', 'audit_schedules', 'audit_types'
);
IF @sql <> N''
BEGIN
    EXEC sp_executesql @sql;
END
GO

-- 2. Drop obsolete legacy tables (ticketing tables are excluded)
IF OBJECT_ID('EmployeeMaster', 'U') IS NOT NULL DROP TABLE EmployeeMaster;
IF OBJECT_ID('HRM_EMPLOYEE_MASTER', 'U') IS NOT NULL DROP TABLE HRM_EMPLOYEE_MASTER;
IF OBJECT_ID('PRODUCT_MASTER', 'U') IS NOT NULL DROP TABLE PRODUCT_MASTER;
IF OBJECT_ID('SM_CUSTOMER_MASTER', 'U') IS NOT NULL DROP TABLE SM_CUSTOMER_MASTER;
IF OBJECT_ID('SM_VENDOR_MASTER', 'U') IS NOT NULL DROP TABLE SM_VENDOR_MASTER;
IF OBJECT_ID('STATUS_MASTER', 'U') IS NOT NULL DROP TABLE STATUS_MASTER;
IF OBJECT_ID('audit_areas', 'U') IS NOT NULL DROP TABLE audit_areas;
IF OBJECT_ID('audit_attendance', 'U') IS NOT NULL DROP TABLE audit_attendance;
IF OBJECT_ID('audit_criteria', 'U') IS NOT NULL DROP TABLE audit_criteria;
IF OBJECT_ID('audit_observation_details', 'U') IS NOT NULL DROP TABLE audit_observation_details;
IF OBJECT_ID('audit_observations', 'U') IS NOT NULL DROP TABLE audit_observations;
IF OBJECT_ID('audit_schedule_criteria', 'U') IS NOT NULL DROP TABLE audit_schedule_criteria;
IF OBJECT_ID('audit_schedules', 'U') IS NOT NULL DROP TABLE audit_schedules;
IF OBJECT_ID('audit_types', 'U') IS NOT NULL DROP TABLE audit_types;
GO
