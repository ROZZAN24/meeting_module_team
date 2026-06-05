-- ============================================================
-- Migration: Create QMS_AUDIT_CRITERIA table
-- Purpose: Create QMS_AUDIT_CRITERIA table matching JPA mapping
-- Date: 2026-06-05
-- ============================================================

USE [AUTONOMA];
GO

IF OBJECT_ID('QMS_AUDIT_CRITERIA', 'U') IS NULL
BEGIN
    CREATE TABLE QMS_AUDIT_CRITERIA (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        SEQ_NO NVARCHAR(50),
        AUDIT_TYPE NVARCHAR(MAX),
        CLAUSE NVARCHAR(255),
        CRITERIA_TEXT NVARCHAR(MAX),
        DEPARTMENT NVARCHAR(MAX),
        ATTACHMENT_REQUIRED NVARCHAR(20),
        STATUS NVARCHAR(50),
        ATTACHMENT_INFO NVARCHAR(MAX),
        LEVEL NVARCHAR(100),
        IS_ACTIVE BIT NOT NULL DEFAULT 1,
        CREATED_USER NVARCHAR(100),
        CREATED_DATE DATETIME,
        UPDATED_USER NVARCHAR(100),
        UPDATED_DATE DATETIME
    );
    PRINT 'Created QMS_AUDIT_CRITERIA table';
END
ELSE
BEGIN
    PRINT 'QMS_AUDIT_CRITERIA table already exists';
END
GO
