-- Sync HRM Core Master Tables
-- This migration creates the core HRM tables referenced by child expansion tables

-- 1. HRM_DEPARTMENT_MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_DEPARTMENT_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_DEPARTMENT_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [DEPT_NO] INT NOT NULL DEFAULT 0,
    [DEPT_NAME] NVARCHAR(100) NOT NULL,
    [NDA_CERTIFICATE] NVARCHAR(10) DEFAULT 'No',
    [SEQ_NO] INT DEFAULT 0,
    [STATUS] NVARCHAR(50) DEFAULT 'Active',
    [CREATED_BY] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_BY] NVARCHAR(100),
    [UPDATED_DATE] DATETIME
);
END

-- 2. HRM_DESIG_LEVEL
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_DESIG_LEVEL]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_DESIG_LEVEL] (
    [ROW_ID] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [LEVEL] NVARCHAR(10),
    [BASIC] FLOAT,
    [DA] FLOAT,
    [HRA] FLOAT,
    [SCREENING_LEVEL] INT,
    [CREATED_BY] NVARCHAR(100) NOT NULL,
    [CREATED_DATE] DATETIME,
    [UPDATED_BY] NVARCHAR(100),
    [UPDATED_DATE] DATETIME
);
END

-- 3. HRM_GRADE_DETAILS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_GRADE_DETAILS]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_GRADE_DETAILS] (
    [ID] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [GRADE_CODE] NVARCHAR(50),
    [SEQ_NO] NVARCHAR(50),
    [GRADE_NAME] NVARCHAR(100),
    [STATUS] NVARCHAR(20) DEFAULT 'Active',
    [CREATED_BY] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_BY] NVARCHAR(100),
    [UPDATED_DATE] DATETIME
);
END

-- 4. HRM_EMPLOYEE_MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMPLOYEE_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [category_id] BIGINT,
    [sub_category_id] NVARCHAR(100),
    [emp_level_id] BIGINT,
    [employee_type_id] BIGINT,
    [grade_code] NVARCHAR(50),
    [title] NVARCHAR(10),
    [first_name] NVARCHAR(100),
    [last_name] NVARCHAR(100),
    [employee_name] NVARCHAR(200),
    [father_husband_name] NVARCHAR(100),
    [emp_code] NVARCHAR(50) UNIQUE,
    [old_emp_code] NVARCHAR(50),
    [guest] NVARCHAR(10),
    [department_id] BIGINT,
    [designation_id] BIGINT,
    [unit_id] BIGINT,
    [production_line] NVARCHAR(100),
    [emp_class] NVARCHAR(50),
    [team_group] NVARCHAR(100),
    [additional_role] NVARCHAR(500),
    [date_of_joining] DATE,
    [confirmation_date] DATE,
    [next_revision_date] DATE,
    [exit_date] DATE,
    [exit_reason] NVARCHAR(255),
    [daily_sheet_required] NVARCHAR(10),
    [attendance_required] NVARCHAR(10),
    [induction_status] NVARCHAR(50),
    [shift] NVARCHAR(10),
    [shift_name] NVARCHAR(100),
    [shift_duration] NVARCHAR(50),
    [grace_minutes] INT,
    [petrol_allowance] DECIMAL(10,2),
    [refer_mode] NVARCHAR(50),
    [user_name] NVARCHAR(100),
    [home_manager] NVARCHAR(100),
    [business_manager] NVARCHAR(100),
    [supplier_name] NVARCHAR(100),
    [profile_upload] NVARCHAR(500),
    [signature] NVARCHAR(500),
    [nda_certificate_upload] NVARCHAR(500),
    [fitness_certificate_upload] NVARCHAR(500),
    [status] NVARCHAR(50) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_date] DATETIME,
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME
);
END
