-- V3.0 Create Checklist Workflow Tables
-- Tables for Assignments, Verification, and Status Master

-- 1. ad_status_master
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ad_status_master]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ad_status_master] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [NAME] NVARCHAR(100) NOT NULL UNIQUE
    );
END

-- 2. Seed ad_status_master
IF NOT EXISTS (SELECT * FROM [dbo].[ad_status_master] WHERE [NAME] = 'Pending')
BEGIN
    INSERT INTO [dbo].[ad_status_master] ([NAME]) VALUES 
    ('Pending'), ('Started'), ('Unresolved'), ('Missed'), ('Completed'), 
    ('Not Completed'), ('25%'), ('50%'), ('75%'), ('Pending for Verified'), 
    ('Verified'), ('Pending for Accepted'), ('Accepted'), ('Attended'), ('Rejected'), ('Open');
END

-- 3. QMS_CHECKLIST_ASSIGNMENT
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QMS_CHECKLIST_ASSIGNMENT]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [CHECKLIST_ID] BIGINT NOT NULL,
        [ASSIGNED_TO] NVARCHAR(255),
        [ASSIGNED_BY] NVARCHAR(255),
        [ASSIGN_TYPE] NVARCHAR(50),
        [ASSIGNED_DATE] DATETIME,
        [STATUS_ID] BIGINT,
        [REMARKS] TEXT,
        [CHECKLIST_DATE] DATE,
        [CARRY_FORWARD] NVARCHAR(50),
        [ACTUAL_FILES] NVARCHAR(MAX),
        CONSTRAINT [FK_Assignment_Checklist] FOREIGN KEY ([CHECKLIST_ID]) REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id]),
        CONSTRAINT [FK_Assignment_Status] FOREIGN KEY ([STATUS_ID]) REFERENCES [dbo].[ad_status_master]([id])
    );
END

-- 4. QMS_CHECKLIST_VERIFICATION
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QMS_CHECKLIST_VERIFICATION]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[QMS_CHECKLIST_VERIFICATION] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [ASSIGNMENT_ID] BIGINT NOT NULL,
        [VERIFIED_BY] NVARCHAR(255),
        [STATUS_ID] BIGINT,
        [REMARKS] TEXT,
        [VERIFIED_DATE] DATETIME,
        CONSTRAINT [FK_Verification_Assignment] FOREIGN KEY ([ASSIGNMENT_ID]) REFERENCES [dbo].[QMS_CHECKLIST_ASSIGNMENT]([id]),
        CONSTRAINT [FK_Verification_Status] FOREIGN KEY ([STATUS_ID]) REFERENCES [dbo].[ad_status_master]([id])
    );
END
-- 5. qms_checklist_department
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[qms_checklist_department]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[qms_checklist_department] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [CHECKLIST_ID] BIGINT NOT NULL,
        [department_name] NVARCHAR(255),
        CONSTRAINT [FK_Dept_Checklist] FOREIGN KEY ([CHECKLIST_ID]) REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id])
    );
END
