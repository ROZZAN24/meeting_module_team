-- V34.0 Add missing audit columns to audit_criterion table
IF OBJECT_ID('audit_criterion', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criterion') AND name = 'level')
    BEGIN
        ALTER TABLE audit_criterion ADD [level] NVARCHAR(100);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criterion') AND name = 'updated_by')
    BEGIN
        ALTER TABLE audit_criterion ADD [updated_by] NVARCHAR(100);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criterion') AND name = 'updated_at')
    BEGIN
        ALTER TABLE audit_criterion ADD [updated_at] DATETIME;
    END
END

IF OBJECT_ID('audit_criteria', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criteria') AND name = 'level')
    BEGIN
        ALTER TABLE audit_criteria ADD [level] NVARCHAR(100);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criteria') AND name = 'updated_by')
    BEGIN
        ALTER TABLE audit_criteria ADD [updated_by] NVARCHAR(100);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('audit_criteria') AND name = 'updated_at')
    BEGIN
        ALTER TABLE audit_criteria ADD [updated_at] DATETIME;
    END
END
