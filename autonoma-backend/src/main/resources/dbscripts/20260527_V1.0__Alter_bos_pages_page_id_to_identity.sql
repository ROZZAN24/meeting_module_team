-- Alter bos_pages table to make page_id an IDENTITY column
-- This script creates a new table with IDENTITY, copies the data, and replaces the old table.

BEGIN TRANSACTION;

-- 1. Create the new table
CREATE TABLE dbo.bos_pages_new (
    page_id INT IDENTITY(1,1) NOT NULL,
    mod_id INT NOT NULL,
    sub_mod_id INT NULL,
    page_code NVARCHAR(10) NULL,
    page_name NVARCHAR(100) NOT NULL,
    enabled INT NULL,
    page_url VARCHAR(255) NULL,
    icon VARCHAR(100) NULL,
    CONSTRAINT PK_bos_pages_new PRIMARY KEY CLUSTERED (page_id)
);

-- 2. Turn on identity insert to keep existing IDs during copy
SET IDENTITY_INSERT dbo.bos_pages_new ON;

-- 3. Copy existing data
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'bos_pages')
BEGIN
    INSERT INTO dbo.bos_pages_new (page_id, mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon)
    SELECT page_id, mod_id, sub_mod_id, page_code, page_name, enabled, page_url, icon 
    FROM dbo.bos_pages;
END
SET IDENTITY_INSERT dbo.bos_pages_new OFF;

-- 4. Handle Foreign Keys (Drop existing FKs pointing to bos_pages before dropping it)
-- Note: You may need to adjust the FK name based on your database schema
DECLARE @fk_name NVARCHAR(128);
SELECT @fk_name = name 
FROM sys.foreign_keys 
WHERE referenced_object_id = OBJECT_ID('dbo.bos_pages');

IF @fk_name IS NOT NULL
BEGIN
    DECLARE @drop_fk_sql NVARCHAR(MAX) = 'ALTER TABLE dbo.bos_user_page_auth DROP CONSTRAINT ' + @fk_name;
    EXEC sp_executesql @drop_fk_sql;
END

-- 5. Drop the old table
DROP TABLE dbo.bos_pages;

-- 6. Rename the new table to the old table's name
EXEC sp_rename 'dbo.bos_pages_new', 'bos_pages';

-- 7. Re-add the Foreign Key constraint for bos_user_page_auth
ALTER TABLE dbo.bos_user_page_auth
ADD CONSTRAINT FK_bos_user_page_auth_bos_pages FOREIGN KEY (page_id)
REFERENCES dbo.bos_pages (page_id) ON DELETE CASCADE;

COMMIT TRANSACTION;
