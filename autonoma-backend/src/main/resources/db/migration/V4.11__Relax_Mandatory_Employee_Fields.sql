-- V4.11 Relax Mandatory Employee Classification Fields
USE [AUTONOMA];
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'category_id')
    ALTER TABLE hrm_employee_master ALTER COLUMN category_id BIGINT NULL;

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'emp_level_id')
    ALTER TABLE hrm_employee_master ALTER COLUMN emp_level_id BIGINT NULL;

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employee_type_id')
    ALTER TABLE hrm_employee_master ALTER COLUMN employee_type_id BIGINT NULL;

GO
