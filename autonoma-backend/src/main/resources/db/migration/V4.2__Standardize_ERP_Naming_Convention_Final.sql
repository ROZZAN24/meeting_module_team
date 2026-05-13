-- V4.2 Standardize ERP Naming Convention Final
USE [AUTONOMA];

-- Helper procedure to rename columns safely
IF OBJECT_ID('tempdb..#RenameCol') IS NOT NULL DROP PROCEDURE #RenameCol;
GO
CREATE PROCEDURE #RenameCol @tableName NVARCHAR(100), @oldName NVARCHAR(100), @newName NVARCHAR(100)
AS
BEGIN
    DECLARE @actualName NVARCHAR(100);
    SELECT @actualName = name FROM sys.columns 
    WHERE object_id = OBJECT_ID(@tableName) AND name = @oldName;
    
    IF @actualName IS NOT NULL AND @actualName <> @newName
    BEGIN
        DECLARE @fullOldName NVARCHAR(200) = @tableName + '.' + @actualName;
        EXEC sp_rename @fullOldName, @newName, 'COLUMN';
    END
END
GO

-- 1. TABLE RENAMES
IF OBJECT_ID('HRM_EMPLOYEE_MASTER', 'U') IS NOT NULL EXEC sp_rename 'HRM_EMPLOYEE_MASTER', 'hrm_employee_master';
IF OBJECT_ID('EmployeeMaster', 'U') IS NOT NULL AND OBJECT_ID('hrm_employee_master', 'U') IS NULL EXEC sp_rename 'EmployeeMaster', 'hrm_employee_master';
IF OBJECT_ID('DesignationMaster', 'U') IS NOT NULL EXEC sp_rename 'DesignationMaster', 'hrm_designation_master';
IF OBJECT_ID('departments', 'U') IS NOT NULL EXEC sp_rename 'departments', 'hrm_department_master';
IF OBJECT_ID('hrm_desig_level', 'U') IS NOT NULL EXEC sp_rename 'hrm_desig_level', 'hrm_designation_level';
IF OBJECT_ID('AD_USER_CREDENTIALS', 'U') IS NOT NULL EXEC sp_rename 'AD_USER_CREDENTIALS', 'ad_user_credential';
IF OBJECT_ID('audit_schedules', 'U') IS NOT NULL EXEC sp_rename 'audit_schedules', 'audit_schedule';
IF OBJECT_ID('audit_observations', 'U') IS NOT NULL EXEC sp_rename 'audit_observations', 'audit_observation';
IF OBJECT_ID('audit_observation_details', 'U') IS NOT NULL EXEC sp_rename 'audit_observation_details', 'audit_observation_detail';
IF OBJECT_ID('QMS_MASTER_CHECKLIST', 'U') IS NOT NULL EXEC sp_rename 'QMS_MASTER_CHECKLIST', 'qms_checklist_master';

-- 2. COLUMN RENAMES using the helper
EXEC #RenameCol 'audit_observation', 'createdDate', 'created_at';
EXEC #RenameCol 'audit_observation', 'CREATED_DATE', 'created_at';
EXEC #RenameCol 'audit_observation', 'created_date', 'created_at';
EXEC #RenameCol 'audit_observation', 'updatedDate', 'updated_at';
EXEC #RenameCol 'audit_observation', 'UPDATED_DATE', 'updated_at';
EXEC #RenameCol 'audit_observation', 'updated_date', 'updated_at';
EXEC #RenameCol 'audit_observation', 'OBSERVATION_NO', 'observation_no';
EXEC #RenameCol 'audit_observation', 'AUDIT_TYPE', 'audit_type';

EXEC #RenameCol 'audit_schedule', 'createdDate', 'created_at';
EXEC #RenameCol 'audit_schedule', 'updatedDate', 'updated_at';

EXEC #RenameCol 'hrm_employee_master', 'createdDate', 'created_at';
EXEC #RenameCol 'hrm_employee_master', 'updatedDate', 'updated_at';

EXEC #RenameCol 'audit_observation_detail', 'OBSERVATION_ID', 'observation_id';
EXEC #RenameCol 'audit_observation_detail', 'ncrNo', 'ncr_no';

EXEC #RenameCol 'ad_user_credential', 'USER_ID', 'user_id';
EXEC #RenameCol 'ad_user_credential', 'CREATED_DATE', 'created_at';

DROP PROCEDURE #RenameCol;
