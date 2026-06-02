-- ============================================================
-- V37.0 Alter qms_checklist_master: Status columns -> INT
--       and fix column name casing to CAPS
-- ============================================================
USE [AUTONOMA];
GO

-- STEP 1: Add new INT columns alongside old ones
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.qms_checklist_master') AND name = 'STATUS_INT')
BEGIN
    ALTER TABLE [dbo].[qms_checklist_master] ADD [STATUS_INT] INT NULL;
    ALTER TABLE [dbo].[qms_checklist_master] ADD [TASK_STATUS_INT] INT NULL;
    ALTER TABLE [dbo].[qms_checklist_master] ADD [VERIFY_STATUS_INT] INT NULL;
END
GO

-- STEP 2: Migrate data - convert string -> int codes
-- STATUS:        0=INACTIVE/DRAFT, 1=ACTIVE, 2=EXPIRED, 3=PENDING, 4=CANCELLED
-- TASK_STATUS:   0=PENDING,        1=IN_PROGRESS, 2=COMPLETED, 3=OVERDUE,   4=CANCELLED
-- VERIFY_STATUS: 0=PENDING,        1=APPROVED,    2=REJECTED,  3=HOLD

UPDATE [dbo].[qms_checklist_master]
SET [STATUS_INT] = CASE
    WHEN UPPER(LTRIM(RTRIM([STATUS]))) = 'ACTIVE'    THEN 1
    WHEN UPPER(LTRIM(RTRIM([STATUS]))) = 'EXPIRED'   THEN 2
    WHEN UPPER(LTRIM(RTRIM([STATUS]))) = 'PENDING'   THEN 3
    WHEN UPPER(LTRIM(RTRIM([STATUS]))) IN ('CANCELLED', 'CANCELED') THEN 4
    ELSE 0
END
WHERE [STATUS_INT] IS NULL;
GO

UPDATE [dbo].[qms_checklist_master]
SET [TASK_STATUS_INT] = CASE
    WHEN UPPER(LTRIM(RTRIM([TASK_STATUS]))) IN ('IN_PROGRESS','INPROGRESS','IN PROGRESS') THEN 1
    WHEN UPPER(LTRIM(RTRIM([TASK_STATUS]))) IN ('COMPLETED','DONE')                        THEN 2
    WHEN UPPER(LTRIM(RTRIM([TASK_STATUS]))) = 'OVERDUE'                                    THEN 3
    WHEN UPPER(LTRIM(RTRIM([TASK_STATUS]))) IN ('CANCELLED','CANCELED')                    THEN 4
    ELSE 0
END
WHERE [TASK_STATUS_INT] IS NULL;
GO

UPDATE [dbo].[qms_checklist_master]
SET [VERIFY_STATUS_INT] = CASE
    WHEN UPPER(LTRIM(RTRIM([VERIFY_STATUS]))) IN ('APPROVED','APPROVE') THEN 1
    WHEN UPPER(LTRIM(RTRIM([VERIFY_STATUS]))) IN ('REJECTED','REJECT')  THEN 2
    WHEN UPPER(LTRIM(RTRIM([VERIFY_STATUS]))) = 'HOLD'                  THEN 3
    ELSE 0
END
WHERE [VERIFY_STATUS_INT] IS NULL;
GO

-- STEP 3: Drop old VARCHAR status columns
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.qms_checklist_master') AND name = 'STATUS'
           AND system_type_id = TYPE_ID('varchar'))
BEGIN
    ALTER TABLE [dbo].[qms_checklist_master] DROP COLUMN [STATUS];
END
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.qms_checklist_master') AND name = 'TASK_STATUS'
           AND system_type_id = TYPE_ID('varchar'))
BEGIN
    ALTER TABLE [dbo].[qms_checklist_master] DROP COLUMN [TASK_STATUS];
END
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.qms_checklist_master') AND name = 'VERIFY_STATUS'
           AND system_type_id = TYPE_ID('varchar'))
BEGIN
    ALTER TABLE [dbo].[qms_checklist_master] DROP COLUMN [VERIFY_STATUS];
END
GO

-- STEP 4: Rename INT columns back to final names
EXEC sp_rename 'dbo.qms_checklist_master.STATUS_INT',       'STATUS',       'COLUMN';
EXEC sp_rename 'dbo.qms_checklist_master.TASK_STATUS_INT',  'TASK_STATUS',  'COLUMN';
EXEC sp_rename 'dbo.qms_checklist_master.VERIFY_STATUS_INT','VERIFY_STATUS','COLUMN';
GO

-- STEP 5: Fix casing of created_at and updated_at -> CREATED_AT, UPDATED_AT
-- (SQL Server is case-insensitive so this is cosmetic for the schema)
EXEC sp_rename 'dbo.qms_checklist_master.created_at', 'CREATED_AT', 'COLUMN';
EXEC sp_rename 'dbo.qms_checklist_master.updated_at', 'UPDATED_AT', 'COLUMN';
GO

PRINT 'qms_checklist_master: STATUS, TASK_STATUS, VERIFY_STATUS converted to INT. Column names normalized to CAPS.';
GO
