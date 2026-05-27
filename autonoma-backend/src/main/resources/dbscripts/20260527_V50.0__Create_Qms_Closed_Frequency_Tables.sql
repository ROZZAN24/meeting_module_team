-- 20260527_V50.0__Create_Qms_Closed_Frequency_Tables.sql

-- Drop tables if they exist to ensure clean recreated schemas
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_DAILY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_DAILY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_WEEKLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_WEEKLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_FORTNIGHTLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_FORTNIGHTLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_MONTHLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_MONTHLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_QUARTERLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_QUARTERLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_HALF_YEARLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_HALF_YEARLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_YEARLY', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_YEARLY;
IF OBJECT_ID('QMS_CHECKLIST_CLOSED_CUSTOM', 'U') IS NOT NULL DROP TABLE QMS_CHECKLIST_CLOSED_CUSTOM;

-- 1. QMS_CHECKLIST_CLOSED_DAILY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_DAILY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Daily_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Daily_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 2. QMS_CHECKLIST_CLOSED_WEEKLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_WEEKLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Weekly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Weekly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 3. QMS_CHECKLIST_CLOSED_FORTNIGHTLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_FORTNIGHTLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Fortnightly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Fortnightly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 4. QMS_CHECKLIST_CLOSED_MONTHLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_MONTHLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Monthly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Monthly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 5. QMS_CHECKLIST_CLOSED_QUARTERLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_QUARTERLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Quarterly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Quarterly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 6. QMS_CHECKLIST_CLOSED_HALF_YEARLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_HALF_YEARLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_HalfYearly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_HalfYearly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 7. QMS_CHECKLIST_CLOSED_YEARLY
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_YEARLY] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Yearly_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Yearly_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

-- 8. QMS_CHECKLIST_CLOSED_CUSTOM
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_CUSTOM] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id] BIGINT,
    [assigned_to] NVARCHAR(100),
    [assigned_by] NVARCHAR(100),
    [assigned_date] DATETIME,
    [status_id] BIGINT,
    [remarks] NVARCHAR(MAX),
    [checklist_date] DATE,
    [carry_forward] VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count] INT DEFAULT 0,
    [assign_type] VARCHAR(50),
    [verified_by] NVARCHAR(100),
    [verified_date] DATETIME,
    [comments] NVARCHAR(MAX),
    [file_paths] NVARCHAR(MAX),
    [CREATED_USER] NVARCHAR(100),
    [CREATED_DATE] DATETIME,
    [UPDATED_USER] NVARCHAR(100),
    [UPDATED_DATE] DATETIME,
    CONSTRAINT [FK_Closed_Custom_Checklist] FOREIGN KEY ([checklist_id]) REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Custom_Status] FOREIGN KEY ([status_id]) REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);
