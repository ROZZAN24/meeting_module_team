-- Add type and contact_type columns to SM_CONTACT_MASTER table if they do not exist
IF OBJECT_ID('SM_CONTACT_MASTER', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SM_CONTACT_MASTER') AND name = 'type')
    BEGIN
        ALTER TABLE SM_CONTACT_MASTER ADD [type] NVARCHAR(100);
    END

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SM_CONTACT_MASTER') AND name = 'contact_type')
    BEGIN
        ALTER TABLE SM_CONTACT_MASTER ADD [contact_type] NVARCHAR(100);
    END
END
