-- ============================================================
-- Migration: Create QMS_AUDIT_AREA table if not exists
-- Purpose: Resolve missing QMS_AUDIT_AREA table due to legacy race condition/drop on production SQL Server.
-- Date: 2026-06-04
-- ============================================================

IF OBJECT_ID('QMS_AUDIT_AREA', 'U') IS NULL
BEGIN
    CREATE TABLE QMS_AUDIT_AREA (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        TYPE NVARCHAR(50),
        DESCRIPTION NVARCHAR(MAX),
        STATUS NVARCHAR(50) DEFAULT 'Active',
        IS_ACTIVE BIT DEFAULT 1,
        CREATED_USER NVARCHAR(100),
        CREATED_DATE DATETIME DEFAULT GETDATE(),
        UPDATED_USER NVARCHAR(100),
        UPDATED_DATE DATETIME
    );
END
GO
