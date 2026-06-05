-- ============================================================
-- Migration: Add IS_ACTIVE column to QMS Checklist tables
-- Purpose: Add missing column IS_ACTIVE mapped by JPA MasterChecklist entity
-- Date: 2026-06-04
-- ============================================================

-- Add IS_ACTIVE to QMS_CHECKLIST if it exists
IF OBJECT_ID('QMS_CHECKLIST', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST') AND name = 'IS_ACTIVE')
    BEGIN
        ALTER TABLE QMS_CHECKLIST ADD IS_ACTIVE BIT NOT NULL DEFAULT 1;
        PRINT 'Added column IS_ACTIVE to QMS_CHECKLIST';
    END
END
GO

-- Add IS_ACTIVE to QMS_CHECKLIST_MASTER if it exists
IF OBJECT_ID('QMS_CHECKLIST_MASTER', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST_MASTER') AND name = 'IS_ACTIVE')
    BEGIN
        ALTER TABLE QMS_CHECKLIST_MASTER ADD IS_ACTIVE BIT NOT NULL DEFAULT 1;
        PRINT 'Added column IS_ACTIVE to QMS_CHECKLIST_MASTER';
    END
END
GO
