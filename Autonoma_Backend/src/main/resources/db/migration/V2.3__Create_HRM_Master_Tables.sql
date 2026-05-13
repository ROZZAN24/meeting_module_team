-- Sync HRM Core Master Tables
-- This migration creates the core HRM tables referenced by child expansion tables

-- 1. hrm_department_master
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_department_master]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[hrm_department_master] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [dept_no] INT NOT NULL DEFAULT 0,
    [dept_name] NVARCHAR(100) NOT NULL,
    [nda_certificate] NVARCHAR(10) DEFAULT 'No',
    [seq_no] INT DEFAULT 0,
    [status] NVARCHAR(50) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_at] DATETIME,
    [updated_by] NVARCHAR(100),
    [updated_at] DATETIME
);
END

-- 2. hrm_designation_level
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_designation_level]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[hrm_designation_level] (
    [row_id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [level] NVARCHAR(10),
    [basic] FLOAT,
    [da] FLOAT,
    [hra] FLOAT,
    [screening_level] INT,
    [created_by] NVARCHAR(100) NOT NULL,
    [created_at] DATETIME,
    [updated_by] NVARCHAR(100),
    [updated_at] DATETIME
);
END

-- 3. hrm_grade_detail
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_grade_detail]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[hrm_grade_detail] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [grade_code] NVARCHAR(50),
    [seq_no] NVARCHAR(50),
    [grade_name] NVARCHAR(100),
    [status] NVARCHAR(20) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_at] DATETIME,
    [updated_by] NVARCHAR(100),
    [updated_at] DATETIME
);
END

-- 4. hrm_employee_master
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_employee_master]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[hrm_employee_master] (
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
    [created_at] DATETIME,
    [updated_by] NVARCHAR(100),
    [updated_at] DATETIME
);
END
