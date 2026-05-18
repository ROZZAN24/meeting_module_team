-- V6.2 Add Missing Employee Child Columns
-- Adds columns to child tables that were added to the Entities but missed in the database schema

USE [AUTONOMA];
GO

-- 1. hrm_employee_education
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_education') AND name = 'university')
    ALTER TABLE hrm_employee_education ADD university NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_education') AND name = 'type')
    ALTER TABLE hrm_employee_education ADD type NVARCHAR(50);

-- 2. hrm_employee_contact
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'comm_address1')
    ALTER TABLE hrm_employee_contact ADD comm_address1 NVARCHAR(500);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'comm_city')
    ALTER TABLE hrm_employee_contact ADD comm_city NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'comm_state')
    ALTER TABLE hrm_employee_contact ADD comm_state NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'comm_country')
    ALTER TABLE hrm_employee_contact ADD comm_country NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'comm_pin_code')
    ALTER TABLE hrm_employee_contact ADD comm_pin_code NVARCHAR(20);

-- 3. hrm_employee_job_profile
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'account_name')
    ALTER TABLE hrm_employee_job_profile ADD account_name NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'bank_account_type')
    ALTER TABLE hrm_employee_job_profile ADD bank_account_type NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'personal_account_number')
    ALTER TABLE hrm_employee_job_profile ADD personal_account_number NVARCHAR(50);

-- 4. hrm_employee_personal_detail
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'region')
    ALTER TABLE hrm_employee_personal_detail ADD region NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'shirt_size')
    ALTER TABLE hrm_employee_personal_detail ADD shirt_size NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'pant_size')
    ALTER TABLE hrm_employee_personal_detail ADD pant_size NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'shoe_size')
    ALTER TABLE hrm_employee_personal_detail ADD shoe_size NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'height')
    ALTER TABLE hrm_employee_personal_detail ADD height NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'weight')
    ALTER TABLE hrm_employee_personal_detail ADD weight NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'company_issued_mobile')
    ALTER TABLE hrm_employee_personal_detail ADD company_issued_mobile NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'mobile_deduction')
    ALTER TABLE hrm_employee_personal_detail ADD mobile_deduction DECIMAL(10,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'canteen_allowance')
    ALTER TABLE hrm_employee_personal_detail ADD canteen_allowance DECIMAL(10,2);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'loan_installment_month')
    ALTER TABLE hrm_employee_personal_detail ADD loan_installment_month NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'email_id')
    ALTER TABLE hrm_employee_personal_detail ADD email_id NVARCHAR(255);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'blood_group')
    ALTER TABLE hrm_employee_personal_detail ADD blood_group NVARCHAR(10);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'passport_number')
    ALTER TABLE hrm_employee_personal_detail ADD passport_number NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'passport_issue_city')
    ALTER TABLE hrm_employee_personal_detail ADD passport_issue_city NVARCHAR(100);

-- 5. hrm_employee_dependent
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_dependent') AND name = 'blood_group')
    ALTER TABLE hrm_employee_dependent ADD blood_group NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_dependent') AND name = 'contact_number1')
    ALTER TABLE hrm_employee_dependent ADD contact_number1 NVARCHAR(20);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_dependent') AND name = 'relationship')
    ALTER TABLE hrm_employee_dependent ADD relationship NVARCHAR(50);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_dependent') AND name = 'occupation')
    ALTER TABLE hrm_employee_dependent ADD occupation NVARCHAR(100);

-- 6. hrm_employee_asset
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_asset') AND name = 'condition_of_asset')
    ALTER TABLE hrm_employee_asset ADD condition_of_asset NVARCHAR(100);
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_asset') AND name = 'qty')
    ALTER TABLE hrm_employee_asset ADD qty INT;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_asset') AND name = 'value')
    ALTER TABLE hrm_employee_asset ADD value DECIMAL(12,2);

GO
