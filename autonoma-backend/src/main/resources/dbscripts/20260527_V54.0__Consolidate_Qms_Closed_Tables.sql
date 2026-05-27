-- 20260527_V54.0__Consolidate_Qms_Closed_Tables.sql
-- Consolidates the 8 frequency tables and union view into a single table.

-- ─── 1. Drop the existing unified view first ───────────────────────────────
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED', 'V') IS NOT NULL
    DROP VIEW dbo.QMS_CHECKLIST_CLOSED;
GO

-- ─── 2. Drop the existing physical frequency tables if they exist ───────────
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_DAILY',       'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_DAILY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_WEEKLY',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_WEEKLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_FORTNIGHTLY', 'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_FORTNIGHTLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_MONTHLY',     'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_MONTHLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_QUARTERLY',   'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_QUARTERLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_HALF_YEARLY', 'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_HALF_YEARLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_YEARLY',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_YEARLY;
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED_CUSTOM',      'U') IS NOT NULL DROP TABLE dbo.QMS_CHECKLIST_CLOSED_CUSTOM;

-- If a table named QMS_CHECKLIST_CLOSED already exists from a previous run or Hibernate create, drop it
IF OBJECT_ID('dbo.QMS_CHECKLIST_CLOSED', 'U') IS NOT NULL
    DROP TABLE dbo.QMS_CHECKLIST_CLOSED;
GO

-- ─── 3. Create the single consolidated closed table ─────────────────────────
CREATE TABLE [dbo].[QMS_CHECKLIST_CLOSED] (
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
    [frequency]            NVARCHAR(50) NOT NULL, -- e.g. DAILY, WEEKLY, etc.
    [CREATED_USER]         NVARCHAR(100),
    [CREATED_DATE]         DATETIME,
    [UPDATED_USER]         NVARCHAR(100),
    [UPDATED_DATE]         DATETIME,
    CONSTRAINT [FK_Closed_Checklist] FOREIGN KEY ([checklist_id])
        REFERENCES [dbo].[QMS_CHECKLIST_MASTER]([id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Closed_Status]    FOREIGN KEY ([status_id])
        REFERENCES [dbo].[AD_STATUS_MASTER]([id])
);
GO

-- Create index on frequency and checklist_id for high performance queries
CREATE INDEX [IX_QMS_CHECKLIST_CLOSED_FREQ] ON [dbo].[QMS_CHECKLIST_CLOSED] ([frequency]);
CREATE INDEX [IX_QMS_CHECKLIST_CLOSED_CHECKLIST] ON [dbo].[QMS_CHECKLIST_CLOSED] ([checklist_id]);
GO
