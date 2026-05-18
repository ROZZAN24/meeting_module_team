-- V8.4 Update Employee Master Allowance Columns
-- Converting LOM Allow and PF Restriction to Numeric (Decimal) for better precision.
USE [AUTONOMA];

-- 1. Handle LOM Allow
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'lom_allow')
BEGIN
    -- Drop default constraint if exists
    DECLARE @ConstraintName_lom NVARCHAR(255);
    SELECT @ConstraintName_lom = name FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('hrm_employee_master') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('hrm_employee_master'), 'lom_allow', 'ColumnId');
    IF @ConstraintName_lom IS NOT NULL EXEC('ALTER TABLE hrm_employee_master DROP CONSTRAINT ' + @ConstraintName_lom);

    -- First clear non-numeric data to prevent conversion errors if any exists
    UPDATE hrm_employee_master SET lom_allow = '0.00' WHERE lom_allow = 'NO' OR lom_allow = 'YES' OR lom_allow IS NULL;
    ALTER TABLE hrm_employee_master ALTER COLUMN lom_allow DECIMAL(10, 2);
END

-- 2. Handle PF Restriction
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'pf_restriction')
BEGIN
    -- Drop default constraint if exists
    DECLARE @ConstraintName_pf NVARCHAR(255);
    SELECT @ConstraintName_pf = name FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('hrm_employee_master') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('hrm_employee_master'), 'pf_restriction', 'ColumnId');
    IF @ConstraintName_pf IS NOT NULL EXEC('ALTER TABLE hrm_employee_master DROP CONSTRAINT ' + @ConstraintName_pf);

    -- Set default to 15000.00 as per standard statutory limit if it was NO/YES
    UPDATE hrm_employee_master SET pf_restriction = '15000.00' WHERE pf_restriction = 'NO' OR pf_restriction = 'YES' OR pf_restriction IS NULL;
    ALTER TABLE hrm_employee_master ALTER COLUMN pf_restriction DECIMAL(10, 2);
END
GO
