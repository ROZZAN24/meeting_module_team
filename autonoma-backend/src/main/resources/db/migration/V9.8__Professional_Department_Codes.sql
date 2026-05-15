-- Alter Department Number to String to support professional codes like DEPT-001
ALTER TABLE hrm_department_master ALTER COLUMN dept_no NVARCHAR(50);
GO
