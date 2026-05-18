-- V4.10 Add Missing Employee Columns
USE [AUTONOMA];
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'email')
    ALTER TABLE hrm_employee_master ADD email NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'phone')
    ALTER TABLE hrm_employee_master ADD phone NVARCHAR(50);
GO
