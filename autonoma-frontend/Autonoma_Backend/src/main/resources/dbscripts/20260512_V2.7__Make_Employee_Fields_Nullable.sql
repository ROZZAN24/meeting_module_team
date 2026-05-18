-- Make Employee fields nullable to support optional form fields

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'emp_level_id')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [emp_level_id] BIGINT NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'father_husband_name')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [father_husband_name] NVARCHAR(100) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'old_emp_code')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [old_emp_code] NVARCHAR(50) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'production_line')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [production_line] NVARCHAR(100) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'emp_class')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [emp_class] NVARCHAR(50) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'team_group')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [team_group] NVARCHAR(100) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'shift_name')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [shift_name] NVARCHAR(100) NULL;
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND name = 'shift_duration')
BEGIN
    ALTER TABLE [dbo].[HRM_EMPLOYEE_MASTER] ALTER COLUMN [shift_duration] NVARCHAR(50) NULL;
END