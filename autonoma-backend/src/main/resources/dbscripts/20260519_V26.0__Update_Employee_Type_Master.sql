-- Alter HRM Employee Type Master Table to add description and status
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'description')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD description NVARCHAR(500);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'status')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD status NVARCHAR(20) DEFAULT 'ACTIVE';
END
GO
