-- Add audit columns to hrm_employee_type_master table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'created_by')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD created_by NVARCHAR(100);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'created_at')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD created_at DATETIME DEFAULT GETDATE();
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'updated_by')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD updated_by NVARCHAR(100);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_type_master') AND name = 'updated_at')
BEGIN
    ALTER TABLE hrm_employee_type_master ADD updated_at DATETIME;
END
GO
