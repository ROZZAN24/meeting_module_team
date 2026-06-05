-- V6.5 Hardening Schema Sync
-- Adds missing columns to employee child tables and audit_type to match JPA entities
USE [AUTONOMA];
GO

-- 1. hrm_employee_dependent
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_dependent') AND name = 'date_of_birth')
    ALTER TABLE hrm_employee_dependent ADD date_of_birth DATE;

-- 2. hrm_employee_contact
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'perm_country')
    ALTER TABLE hrm_employee_contact ADD perm_country NVARCHAR(100);

-- 3. hrm_employee_asset
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_asset') AND name = 'serial_no')
    ALTER TABLE hrm_employee_asset ADD serial_no NVARCHAR(100);

-- 4. audit_type
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_type') AND name = 'updated_by')
    ALTER TABLE audit_type ADD updated_by NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('audit_type') AND name = 'updated_at')
    ALTER TABLE audit_type ADD updated_at DATETIME2;

-- 5. hrm_employee_job_profile
-- Pay Components
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'gross_salary')
    ALTER TABLE hrm_employee_job_profile ADD gross_salary DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'net_salary')
    ALTER TABLE hrm_employee_job_profile ADD net_salary DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'basic_salary')
    ALTER TABLE hrm_employee_job_profile ADD basic_salary DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'da')
    ALTER TABLE hrm_employee_job_profile ADD da DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'hra')
    ALTER TABLE hrm_employee_job_profile ADD hra DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'special_allowance')
    ALTER TABLE hrm_employee_job_profile ADD special_allowance DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'performance_incentive')
    ALTER TABLE hrm_employee_job_profile ADD performance_incentive DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'canteen_deduction')
    ALTER TABLE hrm_employee_job_profile ADD canteen_deduction DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'pf_type')
    ALTER TABLE hrm_employee_job_profile ADD pf_type NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'pf_employee')
    ALTER TABLE hrm_employee_job_profile ADD pf_employee DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'esi_employee')
    ALTER TABLE hrm_employee_job_profile ADD esi_employee DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'professional_tax_amount')
    ALTER TABLE hrm_employee_job_profile ADD professional_tax_amount DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'pf_document')
    ALTER TABLE hrm_employee_job_profile ADD pf_document NVARCHAR(MAX);

-- CTC Details
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'monthly_ctc')
    ALTER TABLE hrm_employee_job_profile ADD monthly_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'basic_salary_ctc')
    ALTER TABLE hrm_employee_job_profile ADD basic_salary_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'da_ctc')
    ALTER TABLE hrm_employee_job_profile ADD da_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'special_allowance_ctc')
    ALTER TABLE hrm_employee_job_profile ADD special_allowance_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'canteen_allowance')
    ALTER TABLE hrm_employee_job_profile ADD canteen_allowance DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'performance_incentive_ctc')
    ALTER TABLE hrm_employee_job_profile ADD performance_incentive_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'esi_ctc')
    ALTER TABLE hrm_employee_job_profile ADD esi_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'pf_ctc')
    ALTER TABLE hrm_employee_job_profile ADD pf_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'gross_ctc')
    ALTER TABLE hrm_employee_job_profile ADD gross_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'employer_pf')
    ALTER TABLE hrm_employee_job_profile ADD employer_pf DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'employer_esi')
    ALTER TABLE hrm_employee_job_profile ADD employer_esi DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'uniform_allowance')
    ALTER TABLE hrm_employee_job_profile ADD uniform_allowance DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'shoe_allowance')
    ALTER TABLE hrm_employee_job_profile ADD shoe_allowance DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'mobile_allowance_cug')
    ALTER TABLE hrm_employee_job_profile ADD mobile_allowance_cug DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'annual_ctc')
    ALTER TABLE hrm_employee_job_profile ADD annual_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'salary_ctc')
    ALTER TABLE hrm_employee_job_profile ADD salary_ctc DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'gratuity')
    ALTER TABLE hrm_employee_job_profile ADD gratuity DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'bonus')
    ALTER TABLE hrm_employee_job_profile ADD bonus DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'special_incentive')
    ALTER TABLE hrm_employee_job_profile ADD special_incentive DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'performance_linked_incentive')
    ALTER TABLE hrm_employee_job_profile ADD performance_linked_incentive DECIMAL(18,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'health_insurance')
    ALTER TABLE hrm_employee_job_profile ADD health_insurance DECIMAL(18,2);

GO
