-- V3.8 Fix Audit Schedule Criteria Seq No Type
USE [AUTONOMA];

-- TABLE: audit_schedule_criteria
-- The seq_no column was incorrectly created as INT, but it needs to store alphanumeric values like AC-001.

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule_criteria]') AND name = 'seq_no')
BEGIN
    -- Change column type to NVARCHAR(50)
    ALTER TABLE [dbo].[audit_schedule_criteria] ALTER COLUMN [seq_no] NVARCHAR(50);
END
ELSE IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[audit_schedule_criteria]') AND name = 'seqNo')
BEGIN
    -- Standardize name and type
    ALTER TABLE [dbo].[audit_schedule_criteria] ALTER COLUMN [seqNo] NVARCHAR(50);
    EXEC sp_rename 'audit_schedule_criteria.seqNo', 'seq_no', 'COLUMN';
END
ELSE
BEGIN
    -- Create column if somehow missing
    ALTER TABLE [dbo].[audit_schedule_criteria] ADD [seq_no] NVARCHAR(50);
END
