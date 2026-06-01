-- V14.6 Create QMS Model Name and UOM Tables
-- Standard Flyway Migration

IF OBJECT_ID('qms_model_name', 'U') IS NULL
BEGIN
    CREATE TABLE qms_model_name (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        model_name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(255) NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO

-- Seed standard model names (idempotent, outside table creation block)
IF NOT EXISTS (SELECT 1 FROM qms_model_name WHERE model_name = 'V47')
BEGIN
    IF COL_LENGTH('qms_model_name', 'created_by') IS NOT NULL
    BEGIN
        EXEC sp_executesql N'
        INSERT INTO qms_model_name (model_name, description, status, created_by, created_at)
        VALUES 
        (''V47'', ''Vestas V47 model name reference'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''V82'', ''Vestas V82 model name reference'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''V39'', ''Vestas V39 model name reference'', ''ACTIVE'', ''Seed'', GETDATE());';
    END
    ELSE
    BEGIN
        EXEC sp_executesql N'
        INSERT INTO qms_model_name (model_name, description, status, CREATED_USER, created_at)
        VALUES 
        (''V47'', ''Vestas V47 model name reference'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''V82'', ''Vestas V82 model name reference'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''V39'', ''Vestas V39 model name reference'', ''ACTIVE'', ''Seed'', GETDATE());';
    END
END;
GO

IF OBJECT_ID('qms_uom', 'U') IS NULL
BEGIN
    CREATE TABLE qms_uom (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        uom_code NVARCHAR(50) NOT NULL UNIQUE,
        uom_description NVARCHAR(255) NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO

-- Seed standard UOM codes (idempotent, outside table creation block)
IF NOT EXISTS (SELECT 1 FROM qms_uom WHERE uom_code = 'KW')
BEGIN
    IF COL_LENGTH('qms_uom', 'created_by') IS NOT NULL
    BEGIN
        EXEC sp_executesql N'
        INSERT INTO qms_uom (uom_code, uom_description, status, created_by, created_at)
        VALUES 
        (''KW'', ''Kilowatt power capacity unit'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''MW'', ''Megawatt power capacity unit'', ''ACTIVE'', ''Seed'', GETDATE());';
    END
    ELSE
    BEGIN
        EXEC sp_executesql N'
        INSERT INTO qms_uom (uom_code, uom_description, status, CREATED_USER, created_at)
        VALUES 
        (''KW'', ''Kilowatt power capacity unit'', ''ACTIVE'', ''Seed'', GETDATE()),
        (''MW'', ''Megawatt power capacity unit'', ''ACTIVE'', ''Seed'', GETDATE());';
    END
END;
GO
