-- 20260527_V52.0__Fix_Qms_Closed_Tables_And_View.sql
-- Fixes V50/V51 failure: drops and recreates 8 frequency tables (FK now points to
-- AD_STATUS_MASTER instead of the old STATUS_MASTER name), then recreates the unified view.

-- ─── Drop the view OR table if it already exists (covers both Hibernate DDL
--     auto-create of a TABLE and previous partial migration runs) ─────────────
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED', 'V') IS NOT NULL
    DROP VIEW dbo.QMS_CHECKLIST_CLOSED;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED', 'U') IS NOT NULL
    DROP TABLE dbo.QMS_CHECKLIST_CLOSED;

GO

-- ─── Drop tables (safe if already present from a partial V50 run) ─────────────
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_DAILY',       'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_DAILY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_WEEKLY',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_WEEKLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_FORTNIGHTLY', 'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_FORTNIGHTLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_MONTHLY',     'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_MONTHLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_QUARTERLY',   'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_QUARTERLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_HALF_YEARLY', 'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_HALF_YEARLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_YEARLY',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_YEARLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_CUSTOM',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_CUSTOM;

GO

-- ─── 1. QMS_CHECKLIST_CLOSED_DAILY ───────────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_DAILY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedD_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedD_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 2. QMS_CHECKLIST_CLOSED_WEEKLY ──────────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_WEEKLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedW_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedW_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 3. QMS_CHECKLIST_CLOSED_FORTNIGHTLY ─────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_FORTNIGHTLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedFN_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedFN_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 4. QMS_CHECKLIST_CLOSED_MONTHLY ─────────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_MONTHLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedM_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedM_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 5. QMS_CHECKLIST_CLOSED_QUARTERLY ───────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_QUARTERLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedQ_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedQ_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 6. QMS_CHECKLIST_CLOSED_HALF_YEARLY ─────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_HALF_YEARLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedHY_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedHY_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 7. QMS_CHECKLIST_CLOSED_YEARLY ──────────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_YEARLY] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedY_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedY_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── 8. QMS_CHECKLIST_CLOSED_CUSTOM ──────────────────────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED_CUSTOM] (
    [id]                   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [checklist_id]         BIGINT,
    [assigned_to]          NVARCHAR(100),
    [assigned_by]          NVARCHAR(100),
    [assigned_date]        DATETIME,
    [status_id]            BIGINT,
    [remarks]              NVARCHAR(MAX),
    [checklist_date]       DATE,
    [carry_forward]        VARCHAR(10),
    [carry_forward_status] VARCHAR(10),
    [carry_forward_count]  INT DEFAULT 0,
    [assign_type]          VARCHAR(50),
    [verified_by]          NVARCHAR(100),
    [verified_date]        DATETIME,
    [comments]             NVARCHAR(MAX),
    [file_paths]           NVARCHAR(MAX),
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_ClosedC_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_ClosedC_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);

GO

-- ─── Unified VIEW (QMS_ prefix, no V_ prefix per naming convention) ───────────
CREATE OR ALTER VIEW [dbo].[QMS_CHECKLIST_CLOSED] AS
SELECT 'DAILY'       AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_DAILY]
UNION ALL
SELECT 'WEEKLY'      AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_WEEKLY]
UNION ALL
SELECT 'FORTNIGHTLY' AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_FORTNIGHTLY]
UNION ALL
SELECT 'MONTHLY'     AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_MONTHLY]
UNION ALL
SELECT 'QUARTERLY'   AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_QUARTERLY]
UNION ALL
SELECT 'HALF YEARLY' AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_HALF_YEARLY]
UNION ALL
SELECT 'YEARLY'      AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_YEARLY]
UNION ALL
SELECT 'CUSTOM'      AS [frequency], [id],[checklist_id],[assigned_to],[assigned_by],[assigned_date],[status_id],[remarks],[checklist_date],[carry_forward],[carry_forward_status],[carry_forward_count],[assign_type],[verified_by],[verified_date],[comments],[file_paths],[CREATED_USER],[CREATED_DATE],[UPDATED_USER],[UPDATED_DATE] FROM [dbo].[QMS_CHECKLIST_CLOSED_CUSTOM];
