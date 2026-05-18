-- V4.9 Sync Employee and Designation Schema
USE [AUTONOMA];
GO

-- 1. Fix hrm_employee_master renames if they were missed or reverted
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employeeid')
    EXEC sp_rename 'hrm_employee_master.employeeid', 'emp_code', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'employeename')
    EXEC sp_rename 'hrm_employee_master.employeename', 'employee_name', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'department')
    EXEC sp_rename 'hrm_employee_master.department', 'department_id', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'designation')
    EXEC sp_rename 'hrm_employee_master.designation', 'designation_id', 'COLUMN';

-- 1.1 Add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'email')
    ALTER TABLE hrm_employee_master ADD email NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_employee_master') AND name = 'phone')
    ALTER TABLE hrm_employee_master ADD phone NVARCHAR(50);

-- 2. Fix hrm_designation_master columns (CamelCase/alllowercase -> snake_case)
IF OBJECT_ID('tempdb..#RenameDesignationCol') IS NOT NULL DROP PROCEDURE #RenameDesignationCol;
GO
CREATE PROCEDURE #RenameDesignationCol @oldName NVARCHAR(100), @newName NVARCHAR(100)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = @oldName)
       AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = @newName)
    BEGIN
        EXEC sp_rename @oldName, @newName, 'COLUMN'; -- Wait, sp_rename needs table name in @oldName if not called as EXEC hrm_designation_master.#RenameDesignationCol
    END
END
GO
-- Actually let's do it simply
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationCode') EXEC sp_rename 'hrm_designation_master.designationCode', 'designation_code', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationcode') EXEC sp_rename 'hrm_designation_master.designationcode', 'designation_code', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationName') EXEC sp_rename 'hrm_designation_master.designationName', 'designation_name', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationname') EXEC sp_rename 'hrm_designation_master.designationname', 'designation_name', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'subCategoryLevel') EXEC sp_rename 'hrm_designation_master.subCategoryLevel', 'sub_category_level', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'subcategorylevel') EXEC sp_rename 'hrm_designation_master.subcategorylevel', 'sub_category_level', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'appearInCompetency') EXEC sp_rename 'hrm_designation_master.appearInCompetency', 'appear_in_competency', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'appearincompetency') EXEC sp_rename 'hrm_designation_master.appearincompetency', 'appear_in_competency', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'displaySlNo') EXEC sp_rename 'hrm_designation_master.displaySlNo', 'display_sl_no', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'displayslno') EXEC sp_rename 'hrm_designation_master.displayslno', 'display_sl_no', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'jobDescription') EXEC sp_rename 'hrm_designation_master.jobDescription', 'job_description', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'jobdescription') EXEC sp_rename 'hrm_designation_master.jobdescription', 'job_description', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'orgSeqNo') EXEC sp_rename 'hrm_designation_master.orgSeqNo', 'org_seq_no', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'orgseqno') EXEC sp_rename 'hrm_designation_master.orgseqno', 'org_seq_no', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'budgetedPositions') EXEC sp_rename 'hrm_designation_master.budgetedPositions', 'budgeted_positions', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'budgetedpositions') EXEC sp_rename 'hrm_designation_master.budgetedpositions', 'budgeted_positions', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'createdBy') EXEC sp_rename 'hrm_designation_master.createdBy', 'created_by', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'createdby') EXEC sp_rename 'hrm_designation_master.createdby', 'created_by', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'createdDate') EXEC sp_rename 'hrm_designation_master.createdDate', 'created_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'createddate') EXEC sp_rename 'hrm_designation_master.createddate', 'created_at', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updatedBy') EXEC sp_rename 'hrm_designation_master.updatedBy', 'updated_by', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updatedby') EXEC sp_rename 'hrm_designation_master.updatedby', 'updated_by', 'COLUMN';

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updatedDate') EXEC sp_rename 'hrm_designation_master.updatedDate', 'updated_at', 'COLUMN';
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updateddate') EXEC sp_rename 'hrm_designation_master.updateddate', 'updated_at', 'COLUMN';

GO
