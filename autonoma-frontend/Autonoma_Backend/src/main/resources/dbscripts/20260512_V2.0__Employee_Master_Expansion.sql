-- =====================================================
-- V2.0 Employee Master Expansion
-- Adds child tables for the full Employee Master module
-- =====================================================

-- 1. EMPLOYEE PERSONAL DETAILS (1:1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_PERSONAL_DETAIL]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_PERSONAL_DETAIL] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [gender] NVARCHAR(20),
    [birth_date] DATE,
    [marital_status] NVARCHAR(30),
    [marriage_date] DATE,
    [number_of_children] INT,
    [email_id] NVARCHAR(255),
    [nationality] NVARCHAR(100),
    [blood_group] NVARCHAR(10),
    [religion] NVARCHAR(50),
    [height] NVARCHAR(20),
    [weight] NVARCHAR(20),
    [shirt_size] NVARCHAR(20),
    [pant_size] NVARCHAR(20),
    [shoe_size] NVARCHAR(20),
    [insurance_number] NVARCHAR(100),
    [esic_number] NVARCHAR(100),
    [pf_number] NVARCHAR(100),
    [insurance_expiry_date] DATE,
    [uan_number] NVARCHAR(100),
    [pan_number] NVARCHAR(20),
    [aadhar_number] NVARCHAR(20),
    [driving_license_number] NVARCHAR(50),
    [license_expiry_date] DATE,
    [election_card_number] NVARCHAR(50),
    [ration_card_number] NVARCHAR(50),
    [company_issued_mobile] NVARCHAR(20),
    [mobile_deduction] DECIMAL(10,2),
    [canteen_allowance] DECIMAL(10,2),
    [loan_installment_month] NVARCHAR(50),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_personal_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 2. EMPLOYEE CONTACT DETAILS (1:1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_CONTACT]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_CONTACT] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [perm_address1] NVARCHAR(255),
    [perm_address2] NVARCHAR(255),
    [perm_city] NVARCHAR(100),
    [perm_state] NVARCHAR(100),
    [perm_pin_code] NVARCHAR(20),
    [perm_phone] NVARCHAR(20),
    [perm_mobile] NVARCHAR(20),
    [comm_address1] NVARCHAR(255),
    [comm_address2] NVARCHAR(255),
    [comm_city] NVARCHAR(100),
    [comm_state] NVARCHAR(100),
    [comm_pin_code] NVARCHAR(20),
    [comm_phone] NVARCHAR(20),
    [comm_mobile] NVARCHAR(20),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_contact_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 3. EMPLOYEE JOB PROFILE (1:1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_JOB_PROFILE]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_JOB_PROFILE] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [wages_type] NVARCHAR(50),
    [payment_mode] NVARCHAR(50),
    [salary_account_number] NVARCHAR(50),
    [personal_account_number] NVARCHAR(50),
    [bank_name] NVARCHAR(100),
    [ifsc_code] NVARCHAR(20),
    [branch_name] NVARCHAR(100),
    [bank_micro_code] NVARCHAR(50),
    [office_email] NVARCHAR(255),
    [official_password] NVARCHAR(255),
    [provident_fund] NVARCHAR(10),
    [esi_allowed] NVARCHAR(10),
    [professional_tax] NVARCHAR(10),
    [bonus] NVARCHAR(10),
    [over_time_allowed] NVARCHAR(10),
    [over_time_factorial] NVARCHAR(20),
    [physically_challenged] NVARCHAR(10),
    [loss_of_minutes_deduct] NVARCHAR(10),
    [loss_of_minutes_allow] NVARCHAR(10),
    [international_worker] NVARCHAR(10),
    [lta_eligible] NVARCHAR(10),
    [pf_restriction_to] NVARCHAR(50),
    [company_contact1] NVARCHAR(20),
    [company_contact2] NVARCHAR(20),
    [over_time_rate_per_hour] DECIMAL(10,2),
    [number_of_leave_allow] INT,
    [asset_id1] NVARCHAR(50),
    [ip_address1] NVARCHAR(50),
    [asset_id2] NVARCHAR(50),
    [ip_address2] NVARCHAR(50),
    [permission_request] NVARCHAR(10),
    [permission_hours] NVARCHAR(20),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_jobprofile_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 4. EMPLOYEE EDUCATION (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EDUCATION]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_EDUCATION] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [education] NVARCHAR(100),
    [institution_name] NVARCHAR(255),
    [type] NVARCHAR(50),
    [year_of_passing] NVARCHAR(10),
    [percentage_grade] NVARCHAR(20),
    [documents] NVARCHAR(500),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_education_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 5. EMPLOYEE EXPERIENCE (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EXPERIENCE]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_EXPERIENCE] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [company_name] NVARCHAR(255),
    [location] NVARCHAR(255),
    [from_date] DATE,
    [to_date] DATE,
    [total_experience_months] INT,
    [documents] NVARCHAR(500),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_experience_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 6. EMPLOYEE EMERGENCY CONTACT (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_EMERGENCY_CONTACT]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_EMERGENCY_CONTACT] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [contact_name] NVARCHAR(100),
    [relation] NVARCHAR(50),
    [address1] NVARCHAR(255),
    [address2] NVARCHAR(255),
    [mobile_number] NVARCHAR(20),
    [home_phone_number] NVARCHAR(20),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_emergency_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 7. EMPLOYEE PASSPORT (1:1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_PASSPORT]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_PASSPORT] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [passport_number] NVARCHAR(50),
    [passport_issue_city] NVARCHAR(100),
    [issue_date] DATE,
    [expiry_date] DATE,
    [comments] NVARCHAR(MAX),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_passport_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 8. EMPLOYEE DEPENDENT (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_DEPENDENT]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_DEPENDENT] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [relation_name] NVARCHAR(100),
    [relation] NVARCHAR(50),
    [gender] NVARCHAR(20),
    [marital_status] NVARCHAR(30),
    [aadhar_id] NVARCHAR(20),
    [contact_number1] NVARCHAR(20),
    [contact_number2] NVARCHAR(20),
    [contact_address] NVARCHAR(500),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_dependent_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 9. EMPLOYEE ASSET (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_ASSET]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_ASSET] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [asset_id] NVARCHAR(50),
    [asset_name] NVARCHAR(255),
    [value] DECIMAL(12,2),
    [issue_date] DATE,
    [comments] NVARCHAR(MAX),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_asset_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 10. EMPLOYEE KYC (1:1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_KYC]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_KYC] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [pf_number] NVARCHAR(100),
    [uan_number] NVARCHAR(100),
    [pan_number] NVARCHAR(20),
    [aadhar_number] NVARCHAR(20),
    [driving_license_number] NVARCHAR(50),
    [license_expiry_date] DATE,
    [election_card_number] NVARCHAR(50),
    [ration_card_number] NVARCHAR(50),
    [personal_account_number] NVARCHAR(50),
    [bank_name] NVARCHAR(100),
    [ifsc_code] NVARCHAR(20),
    [physically_challenged] NVARCHAR(10),
    [physically_challenged_category] NVARCHAR(50),
    [international_worker] NVARCHAR(10),
    [passport_number] NVARCHAR(50),
    [passport_expiry_date] DATE,
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_kyc_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 11. EMPLOYEE KYC DOCUMENT (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_KYC_DOCUMENT]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_KYC_DOCUMENT] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [seq_no] INT,
    [document_name] NVARCHAR(255),
    [document_number] NVARCHAR(100),
    [attachment] NVARCHAR(500),
    [file_name] NVARCHAR(255),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_kycdoc_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END

-- 12. EMPLOYEE ACTIVITY (1:N)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HRM_EMP_ACTIVITY]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[HRM_EMP_ACTIVITY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employee_id] BIGINT NOT NULL,
    [activity_details] NVARCHAR(MAX),
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME,
    CONSTRAINT FK_activity_employee FOREIGN KEY ([employee_id]) REFERENCES [HRM_EMPLOYEE_MASTER]([id]) ON DELETE CASCADE
);
END
