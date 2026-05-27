-- 20260527_V53.0__Drop_Deprecated_Checklist_Tables.sql
-- Drops two deprecated QMS Checklist tables that are no longer part of the architecture:
--   1. QMS_CHECKLIST_VERIFICATION  – superseded by verification columns in QMS_CHECKLIST_CLOSED_* tables
--   2. QMS_MASTER_CHECKLIST        – old legacy table from pre-migration era, replaced by QMS_CHECKLIST_MASTER

-- ─── Drop QMS_CHECKLIST_VERIFICATION ─────────────────────────────────────────
IF OBJECT_ID('dbo.QMS_CHECKLIST_VERIFICATION', 'U') IS NOT NULL
BEGIN
    -- Remove any FK constraints that reference this table before dropping
    DECLARE @sql1 NVARCHAR(MAX) = '';
    SELECT @sql1 += 'ALTER TABLE [' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];'
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.QMS_CHECKLIST_VERIFICATION');
    IF LEN(@sql1) > 0 EXEC sp_executesql @sql1;

    DROP TABLE dbo.QMS_CHECKLIST_VERIFICATION;
    PRINT 'Dropped: QMS_CHECKLIST_VERIFICATION';
END
ELSE
    PRINT 'Skipped: QMS_CHECKLIST_VERIFICATION does not exist';

GO

-- ─── Drop QMS_MASTER_CHECKLIST (legacy pre-migration table) ──────────────────
IF OBJECT_ID('dbo.QMS_MASTER_CHECKLIST', 'U') IS NOT NULL
BEGIN
    -- Remove any FK constraints that reference this table before dropping
    DECLARE @sql2 NVARCHAR(MAX) = '';
    SELECT @sql2 += 'ALTER TABLE [' + OBJECT_NAME(parent_object_id) + '] DROP CONSTRAINT [' + name + '];'
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID('dbo.QMS_MASTER_CHECKLIST');
    IF LEN(@sql2) > 0 EXEC sp_executesql @sql2;

    DROP TABLE dbo.QMS_MASTER_CHECKLIST;
    PRINT 'Dropped: QMS_MASTER_CHECKLIST';
END
ELSE
    PRINT 'Skipped: QMS_MASTER_CHECKLIST does not exist';
