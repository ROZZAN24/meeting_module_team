-- V3.2 Update Checklist Foreign Keys with ON DELETE CASCADE

-- 1. Update FK_Assignment_Checklist
IF EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Assignment_Checklist'
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT] 
    DROP CONSTRAINT [FK_Assignment_Checklist];
END

IF NOT EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Assignment_Checklist'
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_ASSIGNMENT]
    ADD CONSTRAINT [FK_Assignment_Checklist]
    FOREIGN KEY ([CHECKLIST_ID])
    REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id])
    ON DELETE NO ACTION;
END


-- 2. Update FK_Verification_Assignment
IF EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Verification_Assignment'
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_VERIFICATION]
    DROP CONSTRAINT [FK_Verification_Assignment];
END

IF NOT EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Verification_Assignment'
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_VERIFICATION]
    ADD CONSTRAINT [FK_Verification_Assignment]
    FOREIGN KEY ([ASSIGNMENT_ID])
    REFERENCES [dbo].[QMS_CHECKLIST_ASSIGNMENT]([id])
    ON DELETE NO ACTION;
END


-- 3. Update FK_Dept_Checklist
IF EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE name = 'FK_Dept_Checklist'
)
BEGIN
    ALTER TABLE [dbo].[QMS_CHECKLIST_DEPARTMENT]
    DROP CONSTRAINT [FK_Dept_Checklist];
END

IF EXISTS (
    SELECT * 
    FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[QMS_CHECKLIST_DEPARTMENT]')
    AND type = 'U'
)
BEGIN
    IF NOT EXISTS (
        SELECT * 
        FROM sys.foreign_keys 
        WHERE name = 'FK_Dept_Checklist'
    )
    BEGIN
        ALTER TABLE [dbo].[QMS_CHECKLIST_DEPARTMENT]
        ADD CONSTRAINT [FK_Dept_Checklist]
        FOREIGN KEY ([CHECKLIST_ID])
        REFERENCES [dbo].[QMS_MASTER_CHECKLIST]([id])
        ON DELETE NO ACTION;
    END
END