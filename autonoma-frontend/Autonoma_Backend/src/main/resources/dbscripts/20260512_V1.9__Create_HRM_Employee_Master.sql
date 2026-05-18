-- =====================================================
-- V1.9 Create HRM Employee Master
-- Defines the primary table for the Employee Master module
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMPLOYEE_MASTER]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMPLOYEE_MASTER] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    
    -- Classification
    [category_id] BIGINT,
    [sub_category_id] BIGINT,
    [emp_level_id] BIGINT,
    [employee_type_id] BIGINT,
    [grade_code] NVARCHAR(50),
    
    -- Identity
    [title] NVARCHAR(10),
    [first_name] NVARCHAR(100),
    [last_name] NVARCHAR(100),
    [employee_name] NVARCHAR(200),
    [father_husband_name] NVARCHAR(100),
    [emp_code] NVARCHAR(50) UNIQUE,
    [old_emp_code] NVARCHAR(50),
    [guest] NVARCHAR(10),
    
    -- Organization
    [department_id] BIGINT,
    [designation_id] BIGINT,
    [unit_id] BIGINT,
    [production_line] NVARCHAR(100),
    [emp_class] NVARCHAR(50),
    [team_group] NVARCHAR(100),
    [additional_role] NVARCHAR(100),
    
    -- Dates
    [date_of_joining] DATE,
    [confirmation_date] DATE,
    [next_revision_date] DATE,
    [exit_date] DATE,
    [exit_reason] NVARCHAR(255),
    
    -- Operations
    [daily_sheet_required] NVARCHAR(10),
    [attendance_required] NVARCHAR(10),
    [induction_status] NVARCHAR(50),
    [shift] NVARCHAR(10),
    [shift_name] NVARCHAR(100),
    [shift_duration] NVARCHAR(50),
    [grace_minutes] INT,
    [petrol_allowance] DECIMAL(10,2),
    
    -- References
    [refer_mode] NVARCHAR(50),
    [user_name] NVARCHAR(100),
    [home_manager] NVARCHAR(100),
    [business_manager] NVARCHAR(100),
    [supplier_name] NVARCHAR(100),
    
    -- Uploads
    [profile_upload] NVARCHAR(500),
    [signature] NVARCHAR(500),
    [nda_certificate_upload] NVARCHAR(500),
    [fitness_certificate_upload] NVARCHAR(500),
    
    -- Audit
    [status] NVARCHAR(50) DEFAULT 'Active',
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME
);
END
