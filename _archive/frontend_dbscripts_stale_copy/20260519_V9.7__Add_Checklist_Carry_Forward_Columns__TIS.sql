-- Migration: Add Carry Forward columns to Checklist Assignment table
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[qms_checklist_assignment]') 
    AND name = 'carry_forward_status'
)
BEGIN
    ALTER TABLE [dbo].[qms_checklist_assignment] ADD [carry_forward_status] VARCHAR(255) DEFAULT 'NO';
END

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[qms_checklist_assignment]') 
    AND name = 'carry_forward_count'
)
BEGIN
    ALTER TABLE [dbo].[qms_checklist_assignment] ADD [carry_forward_count] INT DEFAULT 0;
END

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[qms_checklist_master]') 
    AND name = 'carry_forward_status'
)
BEGIN
    ALTER TABLE [dbo].[qms_checklist_master] ADD [carry_forward_status] VARCHAR(255) DEFAULT 'NO';
END
