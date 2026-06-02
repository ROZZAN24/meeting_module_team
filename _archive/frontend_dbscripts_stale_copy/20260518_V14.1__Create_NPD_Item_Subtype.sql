-- V14.1 Create NPD Item Sub Type Table
-- Standard Flyway Migration

-- 1. Ensure the parent Item Types exist in npd_item_type for seeding
IF NOT EXISTS (SELECT 1 FROM npd_item_type WHERE item_type = 'COUPLINGS')
BEGIN
    DECLARE @group_mfg BIGINT;
    SELECT TOP 1 @group_mfg = id FROM npd_item_group WHERE group_name = 'Manufacturing Item';
    IF @group_mfg IS NULL SELECT TOP 1 @group_mfg = id FROM npd_item_group;
    
    INSERT INTO npd_item_type (group_id, item_type, group_prefix, item_prefix, is_auto_generate_code, prefix_based, status, created_by, created_at)
    VALUES (@group_mfg, 'COUPLINGS', 'MFG', 'CPL', 'YES', 'TYPE', 'ACTIVE', 'System', GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM npd_item_type WHERE item_type = 'RM')
BEGIN
    DECLARE @group_pur BIGINT;
    SELECT TOP 1 @group_pur = id FROM npd_item_group WHERE group_name = 'Purchase item';
    IF @group_pur IS NULL SELECT TOP 1 @group_pur = id FROM npd_item_group;

    INSERT INTO npd_item_type (group_id, item_type, group_prefix, item_prefix, is_auto_generate_code, prefix_based, status, created_by, created_at)
    VALUES (@group_pur, 'RM', 'PUR', 'RM', 'YES', 'TYPE', 'ACTIVE', 'System', GETDATE());
END;
GO

-- 2. Create npd_item_subtype Table
IF OBJECT_ID('npd_item_subtype', 'U') IS NULL
BEGIN
    CREATE TABLE npd_item_subtype (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        type_id BIGINT NOT NULL FOREIGN KEY REFERENCES npd_item_type(id),
        sub_type NVARCHAR(100) NOT NULL,
        sub_item_prefix NVARCHAR(50) NULL,
        is_auto_generate_code NVARCHAR(10) DEFAULT 'YES' NOT NULL,
        prefix_based NVARCHAR(20) DEFAULT 'SUB ITEM' NOT NULL,
        status NVARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL,
        CONSTRAINT uq_type_subtype UNIQUE (type_id, sub_type)
    );
END;
GO

-- 3. Seed exact requested records
IF NOT EXISTS (SELECT 1 FROM npd_item_subtype WHERE sub_type = 'SHIM COUPLING')
BEGIN
    DECLARE @type_couplings BIGINT;
    SELECT TOP 1 @type_couplings = id FROM npd_item_type WHERE item_type = 'COUPLINGS';
    
    INSERT INTO npd_item_subtype (type_id, sub_type, sub_item_prefix, is_auto_generate_code, prefix_based, status, created_by, created_at)
    VALUES (@type_couplings, 'SHIM COUPLING', 'SHM', 'YES', 'SUB ITEM', 'ACTIVE', 'SIVARAMAN', '2023-11-27 10:00:00');
END;

IF NOT EXISTS (SELECT 1 FROM npd_item_subtype WHERE sub_type = 'PLATES')
BEGIN
    DECLARE @type_rm BIGINT;
    SELECT TOP 1 @type_rm = id FROM npd_item_type WHERE item_type = 'RM';

    INSERT INTO npd_item_subtype (type_id, sub_type, sub_item_prefix, is_auto_generate_code, prefix_based, status, created_by, created_at)
    VALUES (@type_rm, 'PLATES', 'PLT', 'YES', 'SUB ITEM', 'ACTIVE', 'SIVARAMAN', '2023-12-10 10:00:00');
END;
GO
