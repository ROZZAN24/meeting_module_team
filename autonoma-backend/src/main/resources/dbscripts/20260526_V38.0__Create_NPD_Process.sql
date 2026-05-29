-- V38.0 Create NPD Process Master Table and Register Page
-- Standard Flyway Migration

IF OBJECT_ID('npd_process', 'U') IS NULL
BEGIN
    CREATE TABLE npd_process (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        process_name NVARCHAR(150) NOT NULL UNIQUE,
        description NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_by NVARCHAR(100) NULL,
        created_at DATETIME NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME NULL
    );
END;
GO

-- Seed the process master page (M3180) into bos_pages if it is not already present
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M3180')
BEGIN
    -- mod_id = 1 (Masters), sub_mod_id = 31 (Product under NPD)
    INSERT INTO bos_pages (mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    VALUES (1, 31, 'M3180', 'Product Process Master', 1, '/master/npd/product-process', 'IconSitemap');

    -- Grant page permission to all existing users for M3180
    DECLARE @NewPageId INT;
    SELECT @NewPageId = page_id FROM bos_pages WHERE page_code = 'M3180';

    INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
    SELECT 
        u.user_id, 
        @NewPageId, 
        31, -- sub_mod_id (Product)
        1,  -- mod_id (Masters)
        1, 1, 1, 1, 1, 1, 1, 1, 1
    FROM ad_user_credential u;
END;
GO
