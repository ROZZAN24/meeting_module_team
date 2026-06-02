-- V18.1: Fix FK on qms_checklist_department to point to correct table qms_checklist_master
-- The old table QMS_MASTER_CHECKLIST was renamed to qms_checklist_master in V4.2,
-- but the FK on qms_checklist_department still referenced the old name.

-- Drop the old FK constraint
IF EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_Dept_Checklist' 
    AND parent_object_id = OBJECT_ID('qms_checklist_department')
)
BEGIN
    ALTER TABLE [dbo].[qms_checklist_department] DROP CONSTRAINT [FK_Dept_Checklist];
END

-- Re-add FK pointing to the correct (current) table name
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_Dept_Checklist_Master' 
    AND parent_object_id = OBJECT_ID('qms_checklist_department')
)
BEGIN
    ALTER TABLE [dbo].[qms_checklist_department]
        ADD CONSTRAINT [FK_Dept_Checklist_Master] 
        FOREIGN KEY ([CHECKLIST_ID]) 
        REFERENCES [dbo].[qms_checklist_master]([id])
        ON DELETE CASCADE;
END

-- Fix Assignment table FK too if it still points to old table
IF EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_Assignment_Checklist'
    AND parent_object_id = OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT')
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT] DROP CONSTRAINT [FK_Assignment_Checklist];
END

IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE name = 'FK_Assignment_Checklist_Master'
    AND parent_object_id = OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT')
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT]
        ADD CONSTRAINT [FK_Assignment_Checklist_Master]
        FOREIGN KEY ([CHECKLIST_ID])
        REFERENCES [dbo].[qms_checklist_master]([id])
        ON DELETE CASCADE;
END
