-- V8.1 Standardize Audit Infrastructure and Add Masters
-- Created: 2026-05-15
USE [AUTONOMA];

-- 1. Create Country Master
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MASTER_COUNTRY')
BEGIN
    CREATE TABLE MASTER_COUNTRY (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        COUNTRY NVARCHAR(100),
        STATUS NVARCHAR(20) DEFAULT 'Active'
    );
    
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('India', 'Active');
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('USA', 'Active');
    INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('Germany', 'Active');
END;

-- 2. Create State Master
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MASTER_STATE')
BEGIN
    CREATE TABLE MASTER_STATE (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        COUNTRY_NAME NVARCHAR(100),
        STATE_NAME NVARCHAR(100),
        STATE_CODE NVARCHAR(20),
        STATUS NVARCHAR(20) DEFAULT 'Active'
    );
END;

-- 3. Standardize Audit Columns across core tables
DECLARE @TableName NVARCHAR(255);
DECLARE @TableCursor CURSOR;

SET @TableCursor = CURSOR FOR
SELECT name FROM sys.tables WHERE name IN (
    'ad_audit_trail', 
    'hrm_department_master', 
    'hrm_designation_master', 
    'hrm_employee_master', 
    'ad_user_credential',
    'sm_quotation',
    'sm_supplier_master'
);

OPEN @TableCursor;
FETCH NEXT FROM @TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_by') EXEC('ALTER TABLE ' + @TableName + ' ADD created_by NVARCHAR(100)');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_at') EXEC('ALTER TABLE ' + @TableName + ' ADD created_at DATETIME');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_by') EXEC('ALTER TABLE ' + @TableName + ' ADD updated_by NVARCHAR(100)');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_at') EXEC('ALTER TABLE ' + @TableName + ' ADD updated_at DATETIME');
    FETCH NEXT FROM @TableCursor INTO @TableName;
END;

CLOSE @TableCursor;
DEALLOCATE @TableCursor;
