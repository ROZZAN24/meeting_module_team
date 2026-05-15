-- V8.4 Update Employee Master Allowance Columns
-- Converting LOM Allow and PF Restriction to Numeric (Decimal) for better precision.
USE [AUTONOMA];

-- 1. Handle LOM Allow
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'lom_allow')
BEGIN
    -- First clear non-numeric data to prevent conversion errors if any exists
    UPDATE hrm_employee_master SET lom_allow = '0.00' WHERE lom_allow = 'NO' OR lom_allow = 'YES' OR lom_allow IS NULL;
    ALTER TABLE hrm_employee_master ALTER COLUMN lom_allow DECIMAL(10, 2);
END

-- 2. Handle PF Restriction
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'pf_restriction')
BEGIN
    -- Set default to 15000.00 as per standard statutory limit if it was NO/YES
    UPDATE hrm_employee_master SET pf_restriction = '15000.00' WHERE pf_restriction = 'NO' OR pf_restriction = 'YES' OR pf_restriction IS NULL;
    ALTER TABLE hrm_employee_master ALTER COLUMN pf_restriction DECIMAL(10, 2);
END
GO
