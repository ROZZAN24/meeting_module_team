-- Autonoma ERP Full Schema Export
-- Generated on: 2026-05-08 01:58
-- Target: SQL Server


-- 1. HRM DEPARTMENT MASTER
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
    [CREATED_DATE] DATETIME DEFAULT GETDATE(),
    [UPDATED_BY] NVARCHAR(100),
    [UPDATED_DATE] DATETIME
);
END

-- 2. DESIGNATION MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DesignationMaster]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[DesignationMaster] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [designationCode] NVARCHAR(50),
    [designationName] NVARCHAR(MAX),
    [subCategoryLevel] NVARCHAR(MAX),
    [experience] NVARCHAR(MAX),
    [appearInCompetency] NVARCHAR(10),
    [displaySlNo] INT,
    [qualification] NVARCHAR(MAX),
    [jobDescription] NVARCHAR(MAX),
    [orgSeqNo] INT,
    [budgetedPositions] INT,
    [createdBy] NVARCHAR(MAX),
    [createdDate] DATETIME DEFAULT GETDATE(),
    [updatedBy] NVARCHAR(MAX),
    [updatedDate] DATETIME
);
END

-- 3. QMS MASTER CHECKLIST
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QMS_MASTER_CHECKLIST]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[QMS_MASTER_CHECKLIST] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [seq_no] NVARCHAR(50),
    [checking_point] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX),
    [category] NVARCHAR(50),
    [frequency] NVARCHAR(50),
    [effective_from] DATE,
    [expiry_date] DATE,
    [reminder_days] INT,
    [reminder_date] DATE,
    [stock_link] NVARCHAR(10),
    [photo_required] NVARCHAR(10),
    [verification_required] NVARCHAR(10),
    [status] NVARCHAR(50) DEFAULT 'Pending for Verify',
    [created_by] NVARCHAR(100),
    [created_date] DATETIME DEFAULT GETDATE(),
    [updated_by] NVARCHAR(100),
    [updated_date] DATETIME
);
END

-- 4. AUDIT TYPE MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_types]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_types] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [auditType] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(50) DEFAULT 'Active',
    [createdBy] NVARCHAR(255),
    [createdDate] DATETIME DEFAULT GETDATE(),
    [updatedBy] NVARCHAR(255),
    [updatedDate] DATETIME
);
END

-- 5. AUDIT AREA MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_areas]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_areas] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [auditArea] NVARCHAR(255) NOT NULL,
    [status] NVARCHAR(50) DEFAULT 'Active',
    [createdBy] NVARCHAR(255),
    [createdDate] DATETIME DEFAULT GETDATE(),
    [updatedBy] NVARCHAR(255),
    [updatedDate] DATETIME
);
END

-- 6. AUDIT CRITERIA
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_criteria]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_criteria] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [seqNo] NVARCHAR(50),
    [auditType] NVARCHAR(255),
    [clause] NVARCHAR(255),
    [criteriaText] NVARCHAR(MAX),
    [department] NVARCHAR(255),
    [attachmentRequired] NVARCHAR(20),
    [status] NVARCHAR(50),
    [attachmentInfo] NVARCHAR(MAX),
    [createdBy] NVARCHAR(255),
    [createdDate] DATETIME DEFAULT GETDATE(),
    [updatedBy] NVARCHAR(255),
    [updatedDate] DATETIME
);
END

-- 7. AUDIT SCHEDULE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedules]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_schedules] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [scheduleNo] NVARCHAR(50),
    [auditType] NVARCHAR(100),
    [auditArea] NVARCHAR(100),
    [department] NVARCHAR(100),
    [auditDate] DATE,
    [auditor] NVARCHAR(100),
    [auditorDetails] NVARCHAR(MAX),
    [auditee] NVARCHAR(100),
    [auditeeDetails] NVARCHAR(MAX),
    [ncrApprovedBy] NVARCHAR(100),
    [ncrApprovedByDetails] NVARCHAR(MAX),
    [status] NVARCHAR(20) DEFAULT 'OPEN',
    [createdBy] NVARCHAR(100),
    [createdDate] DATETIME DEFAULT GETDATE(),
    [updatedBy] NVARCHAR(100),
    [updatedDate] DATETIME
);
END

-- 8. AUDIT ATTENDANCE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_attendance]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_attendance] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [scheduleNo] NVARCHAR(50),
    [employeeName] NVARCHAR(255),
    [employeeId] NVARCHAR(50),
    [inTime] NVARCHAR(50),
    [outTime] NVARCHAR(50),
    [attendanceStatus] NVARCHAR(50),
    [remarks] NVARCHAR(MAX),
    [createdBy] NVARCHAR(100),
    [createdDate] DATETIME DEFAULT GETDATE()
);
END

-- 9. AUDIT OBSERVATION
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_observations]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_observations] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [observationNo] NVARCHAR(50),
    [observationDate] DATE,
    [auditScheduleNo] NVARCHAR(50),
    [auditType] NVARCHAR(100),
    [departmentName] NVARCHAR(100),
    [auditee] NVARCHAR(100),
    [auditor] NVARCHAR(100),
    [ncrApprovedBy] NVARCHAR(100),
    [status] NVARCHAR(50),
    [auditScore] INT,
    [ofiCount] INT,
    [complianceCount] INT,
    [ncrCount] INT,
    [createdBy] NVARCHAR(100),
    [createdDate] DATETIME DEFAULT GETDATE()
);
END

-- 10. AUDIT OBSERVATION DETAILS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[audit_observation_details]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[audit_observation_details] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [observationId] BIGINT,
    [seqNo] INT,
    [clause] NVARCHAR(255),
    [criteriaDetails] NVARCHAR(MAX),
    [attachmentReq] NVARCHAR(20),
    [observationStatus] NVARCHAR(50),
    [approvalStatus] NVARCHAR(50),
    [comments] NVARCHAR(MAX),
    FOREIGN KEY (observationId) REFERENCES audit_observations(id) ON DELETE CASCADE
);
END

-- 11. EMPLOYEE MASTER
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmployeeMaster]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[EmployeeMaster] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [employeeId] NVARCHAR(50) UNIQUE,
    [employeeName] NVARCHAR(255),
    [email] NVARCHAR(255),
    [phone] NVARCHAR(20),
    [department] NVARCHAR(100),
    [designation] NVARCHAR(100),
    [status] NVARCHAR(50) DEFAULT 'Active',
    [createdBy] NVARCHAR(100),
    [createdDate] DATETIME DEFAULT GETDATE()
);
END
