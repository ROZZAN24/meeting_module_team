-- V8.4 Add Audit Infrastructure to Remaining Master Tables
USE [AUTONOMA];

DECLARE @TableName NVARCHAR(255);
DECLARE @TableCursor CURSOR;

SET @TableCursor = CURSOR FOR
SELECT name FROM sys.tables WHERE name IN (
    'MASTER_COUNTRY',
    'MASTER_STATE',
    'sm_currency',
    'sm_segment',
    'sm_sub_segment',
    'sm_type_of_service',
    'sm_payment_terms',
    'sm_delivery_terms',
    'sm_contact_master',
    'sm_price_master',
    'sm_subcontractor_master',
    'sm_customer_master'
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
