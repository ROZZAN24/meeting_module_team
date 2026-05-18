-- V14.8 Sync Country and State Audit Columns
-- Standard Flyway Migration

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'MASTER_COUNTRY')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_COUNTRY') AND name = 'created_by') 
        ALTER TABLE MASTER_COUNTRY ADD created_by NVARCHAR(100);
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_COUNTRY') AND name = 'created_at') 
        ALTER TABLE MASTER_COUNTRY ADD created_at DATETIME;
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_COUNTRY') AND name = 'updated_by') 
        ALTER TABLE MASTER_COUNTRY ADD updated_by NVARCHAR(100);
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_COUNTRY') AND name = 'updated_at') 
        ALTER TABLE MASTER_COUNTRY ADD updated_at DATETIME;
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'MASTER_STATE')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_STATE') AND name = 'created_by') 
        ALTER TABLE MASTER_STATE ADD created_by NVARCHAR(100);
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_STATE') AND name = 'created_at') 
        ALTER TABLE MASTER_STATE ADD created_at DATETIME;
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_STATE') AND name = 'updated_by') 
        ALTER TABLE MASTER_STATE ADD updated_by NVARCHAR(100);
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MASTER_STATE') AND name = 'updated_at') 
        ALTER TABLE MASTER_STATE ADD updated_at DATETIME;
END;
GO
