-- V79.0 Fix Qms Audit Type Renaming and Column Standardization
-- Target: SQL Server

-- 1. Rename table if old table 'audit_types' exists and new table 'QMS_AUDIT_TYPE' does not
IF OBJECT_ID('audit_types', 'U') IS NOT NULL AND OBJECT_ID('QMS_AUDIT_TYPE', 'U') IS NULL
BEGIN
    EXEC sp_rename 'audit_types', 'QMS_AUDIT_TYPE';
END
GO

-- 2. If 'audit_type' (singular) exists (just in case), rename it too
IF OBJECT_ID('audit_type', 'U') IS NOT NULL AND OBJECT_ID('QMS_AUDIT_TYPE', 'U') IS NULL
BEGIN
    EXEC sp_rename 'audit_type', 'QMS_AUDIT_TYPE';
END
GO

-- 3. If QMS_AUDIT_TYPE still does not exist, create it from scratch
IF OBJECT_ID('QMS_AUDIT_TYPE', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[QMS_AUDIT_TYPE] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [AUDIT_TYPE] NVARCHAR(255),
        [STANDARD] NVARCHAR(255),
        [DESCRIPTION] NVARCHAR(MAX),
        [CRITERIA_MIN_COUNT] INT DEFAULT 0,
        [CUSTOMER_AUDIT_AREA] NVARCHAR(255),
        [AUDIT_AREA] NVARCHAR(255),
        [CRITERIA_TYPE] NVARCHAR(100),
        [STATUS] NVARCHAR(50) DEFAULT 'Active',
        [IS_ACTIVE] BIT DEFAULT 1,
        [CREATED_USER] NVARCHAR(100),
        [CREATED_DATE] DATETIME DEFAULT GETDATE(),
        [UPDATED_USER] NVARCHAR(100),
        [UPDATED_DATE] DATETIME
    );
END
GO

-- 4. Safe column renaming for QMS_AUDIT_TYPE
IF OBJECT_ID('QMS_AUDIT_TYPE', 'U') IS NOT NULL
BEGIN
    -- auditType -> AUDIT_TYPE
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'auditType')
        EXEC sp_rename 'QMS_AUDIT_TYPE.auditType', 'AUDIT_TYPE', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'audit_type')
        EXEC sp_rename 'QMS_AUDIT_TYPE.audit_type', 'AUDIT_TYPE', 'COLUMN';

    -- status -> STATUS
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'status')
        EXEC sp_rename 'QMS_AUDIT_TYPE.status', 'STATUS', 'COLUMN';

    -- createdBy -> CREATED_USER
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'createdBy')
        EXEC sp_rename 'QMS_AUDIT_TYPE.createdBy', 'CREATED_USER', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'created_by')
        EXEC sp_rename 'QMS_AUDIT_TYPE.created_by', 'CREATED_USER', 'COLUMN';

    -- createdDate -> CREATED_DATE
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'createdDate')
        EXEC sp_rename 'QMS_AUDIT_TYPE.createdDate', 'CREATED_DATE', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'created_at')
        EXEC sp_rename 'QMS_AUDIT_TYPE.created_at', 'CREATED_DATE', 'COLUMN';

    -- updatedBy -> UPDATED_USER
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'updatedBy')
        EXEC sp_rename 'QMS_AUDIT_TYPE.updatedBy', 'UPDATED_USER', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'updated_by')
        EXEC sp_rename 'QMS_AUDIT_TYPE.updated_by', 'UPDATED_USER', 'COLUMN';

    -- updatedDate -> UPDATED_DATE
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'updatedDate')
        EXEC sp_rename 'QMS_AUDIT_TYPE.updatedDate', 'UPDATED_DATE', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'updated_at')
        EXEC sp_rename 'QMS_AUDIT_TYPE.updated_at', 'UPDATED_DATE', 'COLUMN';

    -- standard -> STANDARD
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'standard')
        EXEC sp_rename 'QMS_AUDIT_TYPE.standard', 'STANDARD', 'COLUMN';

    -- description -> DESCRIPTION
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'description')
        EXEC sp_rename 'QMS_AUDIT_TYPE.description', 'DESCRIPTION', 'COLUMN';

    -- criteriaMinCount -> CRITERIA_MIN_COUNT
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'criteriaMinCount')
        EXEC sp_rename 'QMS_AUDIT_TYPE.criteriaMinCount', 'CRITERIA_MIN_COUNT', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'criteria_min_count')
        EXEC sp_rename 'QMS_AUDIT_TYPE.criteria_min_count', 'CRITERIA_MIN_COUNT', 'COLUMN';

    -- customerAuditArea -> CUSTOMER_AUDIT_AREA
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'customerAuditArea')
        EXEC sp_rename 'QMS_AUDIT_TYPE.customerAuditArea', 'CUSTOMER_AUDIT_AREA', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'customer_audit_area')
        EXEC sp_rename 'QMS_AUDIT_TYPE.customer_audit_area', 'CUSTOMER_AUDIT_AREA', 'COLUMN';

    -- auditArea -> AUDIT_AREA
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'auditArea')
        EXEC sp_rename 'QMS_AUDIT_TYPE.auditArea', 'AUDIT_AREA', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'audit_area')
        EXEC sp_rename 'QMS_AUDIT_TYPE.audit_area', 'AUDIT_AREA', 'COLUMN';

    -- criteriaType -> CRITERIA_TYPE
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'criteriaType')
        EXEC sp_rename 'QMS_AUDIT_TYPE.criteriaType', 'CRITERIA_TYPE', 'COLUMN';
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'criteria_type')
        EXEC sp_rename 'QMS_AUDIT_TYPE.criteria_type', 'CRITERIA_TYPE', 'COLUMN';

    -- IS_ACTIVE (add if missing)
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_AUDIT_TYPE') AND name = 'IS_ACTIVE')
    BEGIN
        ALTER TABLE QMS_AUDIT_TYPE ADD IS_ACTIVE BIT DEFAULT 1;
    END
END
GO
