-- V14.3 Create NPD OEM Mapping Master Table
-- Standard Flyway Migration

IF OBJECT_ID('npd_oem_mapping', 'U') IS NULL
BEGIN
    CREATE TABLE npd_oem_mapping (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        part_no NVARCHAR(100) NOT NULL UNIQUE,
        oem_part_no NVARCHAR(100) NOT NULL,
        oem_description NVARCHAR(MAX) NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );

    -- Seed exact records requested by user
    INSERT INTO npd_oem_mapping (part_no, oem_part_no, oem_description, status, created_by, created_at, updated_by, updated_at)
    VALUES 
    ('NT/V54121', '115491', '', 'ACTIVE', 'MANGAL', '2025-08-12 16:47:15', 'MANGAL', '2025-08-12 16:47:15'),
    ('NT/GW101', 'GP018631/GP028818', '', 'ACTIVE', 'MANGAL', '2025-08-12 16:47:19', 'MANGAL', '2025-08-12 16:47:19');
END;
GO
