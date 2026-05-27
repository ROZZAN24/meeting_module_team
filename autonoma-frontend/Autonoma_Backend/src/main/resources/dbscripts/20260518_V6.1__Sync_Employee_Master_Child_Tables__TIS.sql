-- V6.1 Sync Employee Master Child Tables
-- Renames tables and columns to match Java Entity mappings to fix 500 errors
USE [AUTONOMA];
GO

-- 1. HRM_EMP_PERSONAL_DETAIL -> hrm_employee_personal_detail
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_PERSONAL_DETAIL]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_PERSONAL_DETAIL', 'hrm_employee_personal_detail';
END

-- Sync columns for hrm_employee_personal_detail
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'created_date')
    EXEC sp_rename 'hrm_employee_personal_detail.created_date', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_personal_detail') AND name = 'updated_date')
    EXEC sp_rename 'hrm_employee_personal_detail.updated_date', 'updated_at', 'COLUMN';

-- 2. HRM_EMP_CONTACT -> hrm_employee_contact
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_CONTACT]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_CONTACT', 'hrm_employee_contact';
END

-- Sync columns for hrm_employee_contact
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'created_date')
    EXEC sp_rename 'hrm_employee_contact.created_date', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_contact') AND name = 'updated_date')
    EXEC sp_rename 'hrm_employee_contact.updated_date', 'updated_at', 'COLUMN';

-- 3. HRM_EMP_JOB_PROFILE -> hrm_employee_job_profile
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_JOB_PROFILE]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_JOB_PROFILE', 'hrm_employee_job_profile';
END

-- Sync columns for hrm_employee_job_profile
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'created_date')
    EXEC sp_rename 'hrm_employee_job_profile.created_date', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_job_profile') AND name = 'updated_date')
    EXEC sp_rename 'hrm_employee_job_profile.updated_date', 'updated_at', 'COLUMN';

-- 4. HRM_EMP_EDUCATION -> hrm_employee_education
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EDUCATION]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_EDUCATION', 'hrm_employee_education';
END

-- Sync columns for hrm_employee_education
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_education') AND name = 'created_date')
    EXEC sp_rename 'hrm_employee_education.created_date', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_education') AND name = 'updated_date')
    EXEC sp_rename 'hrm_employee_education.updated_date', 'updated_at', 'COLUMN';

-- 5. HRM_EMP_EXPERIENCE -> hrm_employee_experience
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EXPERIENCE]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_EXPERIENCE', 'hrm_employee_experience';
END

-- Sync columns for hrm_employee_experience
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_experience') AND name = 'created_date')
    EXEC sp_rename 'hrm_employee_experience.created_date', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_experience') AND name = 'updated_date')
    EXEC sp_rename 'hrm_employee_experience.updated_date', 'updated_at', 'COLUMN';

-- 6. HRM_EMP_EMERGENCY_CONTACT -> hrm_employee_emergency_contact
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EMERGENCY_CONTACT]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_EMERGENCY_CONTACT', 'hrm_employee_emergency_contact';
END

-- 7. HRM_EMP_PASSPORT -> hrm_employee_passport
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_PASSPORT]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_PASSPORT', 'hrm_employee_passport';
END

-- 8. HRM_EMP_DEPENDENT -> hrm_employee_dependent
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_DEPENDENT]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_DEPENDENT', 'hrm_employee_dependent';
END

-- 9. HRM_EMP_ASSET -> hrm_employee_asset
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_ASSET]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_ASSET', 'hrm_employee_asset';
END

-- 10. HRM_EMP_KYC -> hrm_employee_kyc
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_KYC]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_KYC', 'hrm_employee_kyc';
END

-- 11. HRM_EMP_KYC_DOCUMENT -> hrm_employee_kyc_document
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_KYC_DOCUMENT]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_KYC_DOCUMENT', 'hrm_employee_kyc_document';
END

-- 12. HRM_EMP_ACTIVITY -> hrm_employee_activity
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_ACTIVITY]') AND type in (N'U'))
BEGIN
    EXEC sp_rename 'HRM_EMP_ACTIVITY', 'hrm_employee_activity';
END

GO
