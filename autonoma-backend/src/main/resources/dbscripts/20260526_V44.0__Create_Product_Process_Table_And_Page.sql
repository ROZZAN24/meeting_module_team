-- Create npd_process table for Process Master
IF OBJECT_ID('npd_process', 'U') IS NULL
BEGIN
    CREATE TABLE npd_process (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        process_name NVARCHAR(150) NOT NULL UNIQUE,
        description NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_by NVARCHAR(100) NULL,
        created_at DATETIME2 NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME2 NULL
    );
END
GO

-- Register the page M3180 for Process Master under NPD > Product (mod_id = 1, sub_mod_id = 31)
IF NOT EXISTS (SELECT 1 FROM bos_pages WHERE page_code = 'M3180')
BEGIN
    INSERT INTO bos_pages (page_id, mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    SELECT ISNULL(MAX(page_id), 0) + 1, 1, 31, 'M3180', 'Process Master', 1, '/master/npd/product-process', 'IconSitemap'
    FROM bos_pages;
END
GO

-- Grant permissions for M3180 to all existing users
INSERT INTO bos_user_page_auth (user_id, page_id, sub_mod_id, mod_id, enable, read_acs, [write], delete_acs, export, approval, manager, additional1, additional2)
SELECT 
    u.user_id, 
    p.page_id, 
    p.sub_mod_id, 
    p.mod_id, 
    1, 1, 1, 1, 1, 1, 1, 1, 1
FROM bos_pages p
CROSS JOIN ad_user_credential u
WHERE p.page_code = 'M3180'
  AND NOT EXISTS (
      SELECT 1 FROM bos_user_page_auth a 
      WHERE a.user_id = u.user_id AND a.page_id = p.page_id
  );
GO
