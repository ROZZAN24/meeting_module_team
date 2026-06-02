-- V14.0 Create NPD Item Group and Type Tables
-- Standard Flyway Migration

-- 1. Product Item Group Table
IF OBJECT_ID('npd_item_group', 'U') IS NULL
BEGIN
    CREATE TABLE npd_item_group (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        group_name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
    
    -- Seed standard group names
    INSERT INTO npd_item_group (group_name, description, status, created_by, created_at) VALUES 
    ('Billing Item', 'Billing Item Group', 'ACTIVE', 'System', GETDATE()),
    ('Purchase item', 'Purchase Item Group', 'ACTIVE', 'System', GETDATE()),
    ('Manufacturing Item', 'Manufacturing Item Group', 'ACTIVE', 'System', GETDATE());
END;
GO

-- 2. Product Item Type Table
IF OBJECT_ID('npd_item_type', 'U') IS NULL
BEGIN
    CREATE TABLE npd_item_type (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        group_id BIGINT NOT NULL FOREIGN KEY REFERENCES npd_item_group(id),
        item_type NVARCHAR(100) NOT NULL,
        group_prefix NVARCHAR(50) NULL,
        item_prefix NVARCHAR(50) NULL,
        is_auto_generate_code NVARCHAR(10) DEFAULT 'NO' NOT NULL,
        prefix_based NVARCHAR(20) DEFAULT 'GROUP' NOT NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        CONSTRAINT uq_group_item_type UNIQUE (group_id, item_type)
    );
END;
GO
