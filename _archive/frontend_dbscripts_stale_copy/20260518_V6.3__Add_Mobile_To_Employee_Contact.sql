-- V6.3 Add Mobile Columns to Employee Contact
USE [AUTONOMA];
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'mobile')
    ALTER TABLE hrm_employee_contact ADD mobile NVARCHAR(20);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'alternate_mobile')
    ALTER TABLE hrm_employee_contact ADD alternate_mobile NVARCHAR(20);

GO
