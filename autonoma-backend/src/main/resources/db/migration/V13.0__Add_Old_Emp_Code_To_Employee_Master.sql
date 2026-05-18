-- V13.0__Add_Old_Emp_Code_To_Employee_Master.sql
-- Add legacy employee code tracking to the master record

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'hrm_employee_master' AND COLUMN_NAME = 'old_emp_code')
BEGIN
    ALTER TABLE hrm_employee_master ADD old_emp_code NVARCHAR(50);
END
GO
