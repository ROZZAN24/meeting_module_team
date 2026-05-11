-- V3.2 Update Checklist Foreign Keys with ON DELETE CASCADE
-- This ensures that deleting a Master Checklist automatically cleans up all assignments, 
-- verifications, and department links at the database level.

-- 1. Update FK_Assignment_Checklist
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Assignment_Checklist')
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT] DROP CONSTRAINT [FK_Assignment_Checklist];
END

ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT]
ADD CONSTRAINT [FK_Assignment_Checklist] 
FOREIGN KEY ([CHECKLIST_ID]) 
REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id]) 
ON DELETE CASCADE;

-- 2. Update FK_Verification_Assignment
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Verification_Assignment')
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_VERIFICATION] DROP CONSTRAINT [FK_Verification_Assignment];
END

ALTER TABLE [dbo].[QMS_CHECKLIST_VERIFICATION]
ADD CONSTRAINT [FK_Verification_Assignment] 
FOREIGN KEY ([ASSIGNMENT_ID]) 
REFERENCES [dbo].[QMS_CHECKLIST_ASSIGNMENT]([id]) 
ON DELETE CASCADE;

-- 3. Update FK_Dept_Checklist (for QMS_CHECKLIST_DEPARTMENT if it exists)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Dept_Checklist')
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_DEPARTMENT] DROP CONSTRAINT [FK_Dept_Checklist];
END

-- Check if the table exists before adding the constraint (it's created by Hibernate usually)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QMS_CHECKLIST_DEPARTMENT]') AND type in (N'U'))
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_DEPARTMENT]
    ADD CONSTRAINT [FK_Dept_Checklist] 
    FOREIGN KEY ([CHECKLIST_ID]) 
    REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id]) 
    ON DELETE CASCADE;
END
