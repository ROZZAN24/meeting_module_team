-- ============================================================
-- V39.0 ATS / Induction Database Governance & Standardization (Email, Interview, Verification)
-- ============================================================
USE [AUTONOMA];
GO

-- STEP 1: Rename tables to UPPERCASE standard format with module prefix safely using sp_rename
IF OBJECT_ID('hr_email_content', 'U') IS NOT NULL AND OBJECT_ID('IND_EMAIL_CONTENT', 'U') IS NULL
    EXEC sp_rename 'hr_email_content', 'IND_EMAIL_CONTENT';
IF OBJECT_ID('hr_interview_master', 'U') IS NOT NULL AND OBJECT_ID('IND_INTERVIEW_MASTER', 'U') IS NULL
    EXEC sp_rename 'hr_interview_master', 'IND_INTERVIEW_MASTER';
IF OBJECT_ID('hr_verification_criteria', 'U') IS NOT NULL AND OBJECT_ID('IND_VERIFICATION_CRITERIA', 'U') IS NULL
    EXEC sp_rename 'hr_verification_criteria', 'IND_VERIFICATION_CRITERIA';
GO

-- Create temporary helper procedure for safe column renaming on SQL Server
IF OBJECT_ID('dbo.sp_RenameColSafe', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColSafe;
GO

CREATE PROCEDURE dbo.sp_RenameColSafe
    @tbl NVARCHAR(100),
    @old NVARCHAR(100),
    @new NVARCHAR(100)
AS
BEGIN
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @old)
       AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @new)
    BEGIN
        DECLARE @full NVARCHAR(250) = @tbl + '.' + @old;
        EXEC sp_rename @full, @new, 'COLUMN';
    END
END
GO

-- STEP 2: Standardize audit column names (rename created_at/updated_at -> CREATED_DATE/UPDATED_DATE, and created_by/updated_by -> CREATED_USER/UPDATED_USER)
EXEC dbo.sp_RenameColSafe 'IND_EMAIL_CONTENT', 'created_at', 'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_EMAIL_CONTENT', 'updated_at', 'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_EMAIL_CONTENT', 'created_by', 'CREATED_USER';
EXEC dbo.sp_RenameColSafe 'IND_EMAIL_CONTENT', 'updated_by', 'UPDATED_USER';

EXEC dbo.sp_RenameColSafe 'IND_INTERVIEW_MASTER', 'created_at', 'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_INTERVIEW_MASTER', 'updated_at', 'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_INTERVIEW_MASTER', 'created_by', 'CREATED_USER';
EXEC dbo.sp_RenameColSafe 'IND_INTERVIEW_MASTER', 'updated_by', 'UPDATED_USER';

EXEC dbo.sp_RenameColSafe 'IND_VERIFICATION_CRITERIA', 'created_at', 'CREATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_VERIFICATION_CRITERIA', 'updated_at', 'UPDATED_DATE';
EXEC dbo.sp_RenameColSafe 'IND_VERIFICATION_CRITERIA', 'created_by', 'CREATED_USER';
EXEC dbo.sp_RenameColSafe 'IND_VERIFICATION_CRITERIA', 'updated_by', 'UPDATED_USER';
GO

-- Drop rename helper
IF OBJECT_ID('dbo.sp_RenameColSafe', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColSafe;
GO
