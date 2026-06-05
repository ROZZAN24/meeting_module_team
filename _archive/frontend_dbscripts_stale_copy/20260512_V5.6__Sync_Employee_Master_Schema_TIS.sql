-- V5.6 Sync Employee Master Schema
USE [AUTONOMA];
GO

-- Add new columns for EmployeeMaster Entity
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'category_id')
    ALTER TABLE hrm_employee_master ADD category_id BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'emp_level_id')
    ALTER TABLE hrm_employee_master ADD emp_level_id BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employee_type_id')
    ALTER TABLE hrm_employee_master ADD employee_type_id BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'unit_id')
    ALTER TABLE hrm_employee_master ADD unit_id BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'department_id')
    ALTER TABLE hrm_employee_master ADD department_id BIGINT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'designation_id')
    ALTER TABLE hrm_employee_master ADD designation_id BIGINT;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employee_photo_upload')
    ALTER TABLE hrm_employee_master ADD employee_photo_upload NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employee_signature_upload')
    ALTER TABLE hrm_employee_master ADD employee_signature_upload NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'nda_upload')
    ALTER TABLE hrm_employee_master ADD nda_upload NVARCHAR(MAX);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'vertical_head')
    ALTER TABLE hrm_employee_master ADD vertical_head NVARCHAR(200);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'hr_manager')
    ALTER TABLE hrm_employee_master ADD hr_manager NVARCHAR(200);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'office_mail')
    ALTER TABLE hrm_employee_master ADD office_mail NVARCHAR(200);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'office_mail_password')
    ALTER TABLE hrm_employee_master ADD office_mail_password NVARCHAR(200);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'pf_toggle')
    ALTER TABLE hrm_employee_master ADD pf_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'esi_toggle')
    ALTER TABLE hrm_employee_master ADD esi_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'p_tax_toggle')
    ALTER TABLE hrm_employee_master ADD p_tax_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'bonus_toggle')
    ALTER TABLE hrm_employee_master ADD bonus_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'ot_toggle')
    ALTER TABLE hrm_employee_master ADD ot_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'ot_factorial')
    ALTER TABLE hrm_employee_master ADD ot_factorial DECIMAL(10,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'lom_deduction')
    ALTER TABLE hrm_employee_master ADD lom_deduction NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'lom_allow')
    ALTER TABLE hrm_employee_master ADD lom_allow NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'lta_eligible')
    ALTER TABLE hrm_employee_master ADD lta_eligible NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'pf_restriction')
    ALTER TABLE hrm_employee_master ADD pf_restriction NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'permission_toggle')
    ALTER TABLE hrm_employee_master ADD permission_toggle NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'permission_limit')
    ALTER TABLE hrm_employee_master ADD permission_limit DECIMAL(10,2);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'vendor_name')
    ALTER TABLE hrm_employee_master ADD vendor_name NVARCHAR(200);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'refer_mode')
    ALTER TABLE hrm_employee_master ADD refer_mode NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'reference_comments')
    ALTER TABLE hrm_employee_master ADD reference_comments NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'exit_comments')
    ALTER TABLE hrm_employee_master ADD exit_comments NVARCHAR(MAX);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'rejoining_date')
    ALTER TABLE hrm_employee_master ADD rejoining_date DATE;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'petrol_mode')
    ALTER TABLE hrm_employee_master ADD petrol_mode NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'probation_period')
    ALTER TABLE hrm_employee_master ADD probation_period NVARCHAR(255);

GO
