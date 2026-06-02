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

    -- Seed standard model names
    INSERT INTO qms_model_name (model_name, description, status, created_by, created_at)
    VALUES 
    ('V47', 'Vestas V47 model name reference', 'ACTIVE', 'Seed', GETDATE()),
    ('V82', 'Vestas V82 model name reference', 'ACTIVE', 'Seed', GETDATE()),
    ('V39', 'Vestas V39 model name reference', 'ACTIVE', 'Seed', GETDATE());
END;

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

    -- Seed standard UOM codes
    INSERT INTO qms_uom (uom_code, uom_description, status, created_by, created_at)
    VALUES 
    ('KW', 'Kilowatt power capacity unit', 'ACTIVE', 'Seed', GETDATE()),
    ('MW', 'Megawatt power capacity unit', 'ACTIVE', 'Seed', GETDATE());
END;
GO
