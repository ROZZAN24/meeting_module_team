-- V14.2 Create NPD OEM Master Table
-- Standard Flyway Migration

IF OBJECT_ID('npd_oem', 'U') IS NULL
BEGIN
    CREATE TABLE npd_oem (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        oem_short_name NVARCHAR(100) NOT NULL UNIQUE,
        oem_prefix NVARCHAR(50) NULL,
        oem_description NVARCHAR(MAX) NULL,
        origin_country NVARCHAR(100) NULL,
        status_year NVARCHAR(100) NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );

    -- Seed the 25 exact OEM records requested by the user
    INSERT INTO npd_oem (oem_short_name, oem_prefix, oem_description, origin_country, status_year, status, created_by, created_at)
    VALUES 
    ('SUZLON', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('INOX WIND', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('VESTAS', 'V', 'VESTAS', NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('REGEN', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('SENVION/KENERYS', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('GLOBAL WIND', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('PIONEER WINCON', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('LEITWIND', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('RRB (VESTAS)', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('CWEL', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('SIEMENS CAMESA', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('GENERAL', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('ENERCON', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('ADANI', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('NEPC', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('NORDEX ACCIONA', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('NEG MICON', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('MITSUBISHI', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('TACKE', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('TTG', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('AWT', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('BHEL', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('BONUS', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('CARTER', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE()),
    ('ENVISON', NULL, NULL, NULL, NULL, 'ACTIVE', 'System', GETDATE());
END;
GO
