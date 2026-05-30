-- V009__Sales_Transactions_Module.sql
-- Phase 9: Sales & Marketing Transactions Module Schema Standardization
-- Renames and normalizes columns, default constraints, primary keys, and foreign keys of SM_ENQUIRY, SM_PRICE_MASTER, SM_QUOTATION to UPPERCASE snake_case and standardized types

-- ==========================================================
-- 0. Dynamic Foreign Key Drop to prevent dependency locks
-- ==========================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13) + CHAR(10)
FROM sys.foreign_keys
WHERE OBJECT_NAME(referenced_object_id) IN ('SM_ENQUIRY', 'SM_PRICE_MASTER', 'SM_QUOTATION', 'sm_enquiry', 'sm_price_master', 'sm_quotation')
   OR OBJECT_NAME(parent_object_id) IN ('SM_ENQUIRY', 'SM_PRICE_MASTER', 'SM_QUOTATION', 'sm_enquiry', 'sm_price_master', 'sm_quotation');
IF @sql <> N''
BEGIN
    EXEC sp_executesql @sql;
END
GO

-- ==========================================================
-- 1. Helper Stored Procedure for Case-Sensitive Column Renames
-- ==========================================================
IF OBJECT_ID('dbo.sp_RenameColumnCS', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameColumnCS;
GO

CREATE PROCEDURE dbo.sp_RenameColumnCS
    @tableName NVARCHAR(256),
    @oldCol NVARCHAR(256),
    @newCol NVARCHAR(256)
AS
BEGIN
    IF OBJECT_ID(@tableName, 'U') IS NOT NULL
    BEGIN
        -- Check if BOTH columns exist (can happen if Hibernate pre-creates the new column name)
        IF COL_LENGTH(@tableName, @oldCol) IS NOT NULL AND COL_LENGTH(@tableName, @newCol) IS NOT NULL
        BEGIN
            DECLARE @oldRealName NVARCHAR(256) = (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @oldCol);
            DECLARE @newRealName NVARCHAR(256) = (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @newCol);
            
            IF @oldRealName IS NOT NULL AND @newRealName IS NOT NULL AND LOWER(@oldRealName) <> LOWER(@newRealName)
            BEGIN
                -- Merge data from old column to new column
                DECLARE @sqlMerge NVARCHAR(MAX) = 'UPDATE ' + QUOTENAME(@tableName) + ' SET ' + QUOTENAME(@newRealName) + ' = ' + QUOTENAME(@oldRealName) + ' WHERE ' + QUOTENAME(@newRealName) + ' IS NULL';
                EXEC sp_executesql @sqlMerge;
                
                -- Drop default constraint if any exists on the old column
                DECLARE @dropDefault NVARCHAR(MAX) = N'';
                SELECT @dropDefault += N'ALTER TABLE ' + QUOTENAME(@tableName) + ' DROP CONSTRAINT ' + QUOTENAME(d.name) + ';' + CHAR(13) + CHAR(10)
                FROM sys.default_constraints d
                INNER JOIN sys.columns c ON d.parent_column_id = c.column_id AND d.parent_object_id = c.object_id
                WHERE d.parent_object_id = OBJECT_ID(@tableName) AND c.name = @oldRealName;
                IF @dropDefault <> N'' EXEC sp_executesql @dropDefault;

                -- Drop the old duplicate column
                DECLARE @sqlDrop NVARCHAR(MAX) = 'ALTER TABLE ' + QUOTENAME(@tableName) + ' DROP COLUMN ' + QUOTENAME(@oldRealName);
                EXEC sp_executesql @sqlDrop;
                RETURN;
            END
        END

        -- Normal case-sensitive rename flow
        IF COL_LENGTH(@tableName, @oldCol) IS NOT NULL
        BEGIN
            IF (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(@tableName) AND name = @oldCol) COLLATE Latin1_General_CS_AS <> @newCol
            BEGIN
                DECLARE @oldFull NVARCHAR(600) = @tableName + '.' + @oldCol;
                DECLARE @tempCol NVARCHAR(300) = @oldCol + '_TEMP';
                EXEC sp_rename @oldFull, @tempCol, 'COLUMN';
                DECLARE @tempFull NVARCHAR(600) = @tableName + '.' + @tempCol;
                EXEC sp_rename @tempFull, @newCol, 'COLUMN';
            END
        END
    END
END;
GO

-- ==========================================================
-- 2. Drop Default, Unique, Index and Primary Key constraints dynamically
-- ==========================================================
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(d.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.default_constraints d
INNER JOIN sys.tables t ON d.parent_object_id = t.object_id
WHERE t.name IN ('SM_ENQUIRY', 'SM_PRICE_MASTER', 'SM_QUOTATION', 'sm_enquiry', 'sm_price_master', 'sm_quotation', 'SLS_ENQUIRY', 'SLS_PRICE_MASTER', 'SLS_QUOTATION');
IF @sql <> N'' EXEC sp_executesql @sql;
GO

DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(tc.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.key_constraints tc
INNER JOIN sys.tables t ON tc.parent_object_id = t.object_id
WHERE t.name IN ('SM_ENQUIRY', 'SM_PRICE_MASTER', 'SM_QUOTATION', 'sm_enquiry', 'sm_price_master', 'sm_quotation', 'SLS_ENQUIRY', 'SLS_PRICE_MASTER', 'SLS_QUOTATION') AND tc.type IN ('UQ', 'PK');
IF @sql <> N'' EXEC sp_executesql @sql;
GO

DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'DROP INDEX ' + QUOTENAME(i.name) + ' ON ' + QUOTENAME(t.name) + ';' + CHAR(13) + CHAR(10)
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('SM_ENQUIRY', 'SM_PRICE_MASTER', 'SM_QUOTATION', 'sm_enquiry', 'sm_price_master', 'sm_quotation', 'SLS_ENQUIRY', 'SLS_PRICE_MASTER', 'SLS_QUOTATION')
  AND i.is_unique = 1 AND i.is_primary_key = 0 AND i.is_unique_constraint = 0;
IF @sql <> N'' EXEC sp_executesql @sql;
GO

-- ==========================================================
-- 3. Table Renames
-- ==========================================================
IF OBJECT_ID('SM_ENQUIRY', 'U') IS NOT NULL AND OBJECT_ID('SLS_ENQUIRY', 'U') IS NULL
BEGIN
    EXEC sp_rename 'SM_ENQUIRY', 'SLS_ENQUIRY';
END
GO
IF OBJECT_ID('sm_enquiry', 'U') IS NOT NULL AND OBJECT_ID('SLS_ENQUIRY', 'U') IS NULL
BEGIN
    EXEC sp_rename 'sm_enquiry', 'SLS_ENQUIRY';
END
GO

IF OBJECT_ID('SM_PRICE_MASTER', 'U') IS NOT NULL AND OBJECT_ID('SLS_PRICE_MASTER', 'U') IS NULL
BEGIN
    EXEC sp_rename 'SM_PRICE_MASTER', 'SLS_PRICE_MASTER';
END
GO
IF OBJECT_ID('sm_price_master', 'U') IS NOT NULL AND OBJECT_ID('SLS_PRICE_MASTER', 'U') IS NULL
BEGIN
    EXEC sp_rename 'sm_price_master', 'SLS_PRICE_MASTER';
END
GO

-- Create SLS_PRICE_MASTER if it does not exist (fully fallback for fresh DB setups)
IF OBJECT_ID('SLS_PRICE_MASTER', 'U') IS NULL
BEGIN
    CREATE TABLE SLS_PRICE_MASTER (
        id BIGINT IDENTITY(1,1),
        MASTER_NO NVARCHAR(50) NOT NULL,
        ENTRY_DATE DATETIME,
        CUSTOMER_NAME NVARCHAR(200),
        CUSTOMER_ID BIGINT,
        PRODUCT_NAME NVARCHAR(200),
        UNIT_PRICE NVARCHAR(50),
        QUANTITY NVARCHAR(50),
        CURRENCY NVARCHAR(10) DEFAULT 'INR',
        VALID_FROM DATETIME,
        VALID_TO DATETIME,
        TERMS_AND_CONDITIONS NVARCHAR(MAX),
        OCR_DOCUMENT_PATH NVARCHAR(1000),
        OCR_EXTRACTED_TEXT NVARCHAR(MAX),
        OCR_CONFIDENCE NVARCHAR(10),
        STATUS NVARCHAR(50) DEFAULT 'Active',
        REMARKS NVARCHAR(MAX),
        CREATED_USER NVARCHAR(100),
        CREATED_DATE DATETIME DEFAULT GETDATE(),
        UPDATED_USER NVARCHAR(100),
        UPDATED_DATE DATETIME,
        IS_ACTIVE BIT DEFAULT 1
    );
END
GO

IF OBJECT_ID('SM_QUOTATION', 'U') IS NOT NULL AND OBJECT_ID('SLS_QUOTATION', 'U') IS NULL
BEGIN
    EXEC sp_rename 'SM_QUOTATION', 'SLS_QUOTATION';
END
GO
IF OBJECT_ID('sm_quotation', 'U') IS NOT NULL AND OBJECT_ID('SLS_QUOTATION', 'U') IS NULL
BEGIN
    EXEC sp_rename 'sm_quotation', 'SLS_QUOTATION';
END
GO

-- ==========================================================
-- 4. SLS_ENQUIRY Column Standardization
-- ==========================================================
IF OBJECT_ID('SLS_ENQUIRY', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('SLS_ENQUIRY', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_ENQUIRY', 'created_date') IS NOT NULL
        ALTER TABLE SLS_ENQUIRY DROP COLUMN created_at;
    IF COL_LENGTH('SLS_ENQUIRY', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_ENQUIRY', 'updated_date') IS NOT NULL
        ALTER TABLE SLS_ENQUIRY DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'enquiry_no', 'ENQUIRY_NO';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'enquiry_date', 'ENQUIRY_DATE';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'customer_name', 'CUSTOMER_NAME';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'CUSTOMER_ID', 'CUSTOMER_ID';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'contact_person', 'CONTACT_PERSON';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'email', 'EMAIL';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'phone', 'PHONE';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'subject', 'SUBJECT';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'requirements', 'REQUIREMENTS';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'source', 'SOURCE';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'priority', 'PRIORITY';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'ocr_document_path', 'OCR_DOCUMENT_PATH';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'ocr_extracted_text', 'OCR_EXTRACTED_TEXT';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'ocr_confidence', 'OCR_CONFIDENCE';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'SLS_ENQUIRY', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('SLS_ENQUIRY', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_ENQUIRY', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_ENQUIRY.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('SLS_ENQUIRY', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_ENQUIRY', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_ENQUIRY.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE SLS_ENQUIRY ALTER COLUMN ENQUIRY_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN CUSTOMER_NAME NVARCHAR(200);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN CONTACT_PERSON NVARCHAR(200);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN EMAIL NVARCHAR(200);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN PHONE NVARCHAR(50);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN SUBJECT NVARCHAR(500);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN REQUIREMENTS NVARCHAR(MAX);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN SOURCE NVARCHAR(100);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN PRIORITY NVARCHAR(50);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN OCR_DOCUMENT_PATH NVARCHAR(1000);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN OCR_EXTRACTED_TEXT NVARCHAR(MAX);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN OCR_CONFIDENCE NVARCHAR(10);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE SLS_ENQUIRY ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('SLS_ENQUIRY', 'IS_ACTIVE') IS NULL
        ALTER TABLE SLS_ENQUIRY ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 5. SLS_PRICE_MASTER Column Standardization
-- ==========================================================
IF OBJECT_ID('SLS_PRICE_MASTER', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('SLS_PRICE_MASTER', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_PRICE_MASTER', 'created_date') IS NOT NULL
        ALTER TABLE SLS_PRICE_MASTER DROP COLUMN created_at;
    IF COL_LENGTH('SLS_PRICE_MASTER', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_PRICE_MASTER', 'updated_date') IS NOT NULL
        ALTER TABLE SLS_PRICE_MASTER DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'master_no', 'MASTER_NO';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'entry_date', 'ENTRY_DATE';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'customer_name', 'CUSTOMER_NAME';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'CUSTOMER_ID', 'CUSTOMER_ID';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'product_name', 'PRODUCT_NAME';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'unit_price', 'UNIT_PRICE';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'quantity', 'QUANTITY';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'currency', 'CURRENCY';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'valid_from', 'VALID_FROM';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'valid_to', 'VALID_TO';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'terms_and_conditions', 'TERMS_AND_CONDITIONS';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'ocr_document_path', 'OCR_DOCUMENT_PATH';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'ocr_extracted_text', 'OCR_EXTRACTED_TEXT';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'ocr_confidence', 'OCR_CONFIDENCE';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'SLS_PRICE_MASTER', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('SLS_PRICE_MASTER', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_PRICE_MASTER', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_PRICE_MASTER.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('SLS_PRICE_MASTER', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_PRICE_MASTER', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_PRICE_MASTER.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN MASTER_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN CUSTOMER_NAME NVARCHAR(200);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN PRODUCT_NAME NVARCHAR(200);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN UNIT_PRICE NVARCHAR(50);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN QUANTITY NVARCHAR(50);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN CURRENCY NVARCHAR(10);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN TERMS_AND_CONDITIONS NVARCHAR(MAX);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN OCR_DOCUMENT_PATH NVARCHAR(1000);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN OCR_EXTRACTED_TEXT NVARCHAR(MAX);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN OCR_CONFIDENCE NVARCHAR(10);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE SLS_PRICE_MASTER ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('SLS_PRICE_MASTER', 'IS_ACTIVE') IS NULL
        ALTER TABLE SLS_PRICE_MASTER ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 6. SLS_QUOTATION Column Standardization
-- ==========================================================
IF OBJECT_ID('SLS_QUOTATION', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('SLS_QUOTATION', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_QUOTATION', 'created_date') IS NOT NULL
        ALTER TABLE SLS_QUOTATION DROP COLUMN created_at;
    IF COL_LENGTH('SLS_QUOTATION', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_QUOTATION', 'updated_date') IS NOT NULL
        ALTER TABLE SLS_QUOTATION DROP COLUMN updated_at;

    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'quotation_no', 'QUOTATION_NO';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'quotation_date', 'QUOTATION_DATE';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'enquiry_ref', 'ENQUIRY_REF';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'customer_name', 'CUSTOMER_NAME';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'CUSTOMER_ID', 'CUSTOMER_ID';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'contact_person', 'CONTACT_PERSON';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'product_name', 'PRODUCT_NAME';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'description', 'DESCRIPTION';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'quantity', 'QUANTITY';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'unit_price', 'UNIT_PRICE';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'total_amount', 'TOTAL_AMOUNT';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'currency', 'CURRENCY';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'validity_period', 'VALIDITY_PERIOD';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'delivery_terms', 'DELIVERY_TERMS';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'payment_terms', 'PAYMENT_TERMS';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'ocr_document_path', 'OCR_DOCUMENT_PATH';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'ocr_extracted_text', 'OCR_EXTRACTED_TEXT';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'ocr_confidence', 'OCR_CONFIDENCE';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'status', 'STATUS';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'remarks', 'REMARKS';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'created_by', 'CREATED_USER';
    EXEC dbo.sp_RenameColumnCS 'SLS_QUOTATION', 'updated_by', 'UPDATED_USER';

    IF COL_LENGTH('SLS_QUOTATION', 'created_at') IS NOT NULL AND COL_LENGTH('SLS_QUOTATION', 'CREATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_QUOTATION.created_at', 'CREATED_DATE', 'COLUMN';
    IF COL_LENGTH('SLS_QUOTATION', 'updated_at') IS NOT NULL AND COL_LENGTH('SLS_QUOTATION', 'UPDATED_DATE') IS NULL 
        EXEC sp_rename 'SLS_QUOTATION.updated_at', 'UPDATED_DATE', 'COLUMN';

    ALTER TABLE SLS_QUOTATION ALTER COLUMN QUOTATION_NO NVARCHAR(50) NOT NULL;
    ALTER TABLE SLS_QUOTATION ALTER COLUMN ENQUIRY_REF NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN CUSTOMER_NAME NVARCHAR(200);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN CONTACT_PERSON NVARCHAR(200);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN PRODUCT_NAME NVARCHAR(200);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN DESCRIPTION NVARCHAR(MAX);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN QUANTITY NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN UNIT_PRICE NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN TOTAL_AMOUNT NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN CURRENCY NVARCHAR(10);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN VALIDITY_PERIOD NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN DELIVERY_TERMS NVARCHAR(500);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN PAYMENT_TERMS NVARCHAR(500);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN OCR_DOCUMENT_PATH NVARCHAR(1000);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN OCR_EXTRACTED_TEXT NVARCHAR(MAX);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN OCR_CONFIDENCE NVARCHAR(10);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN STATUS NVARCHAR(50);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN REMARKS NVARCHAR(MAX);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN CREATED_USER NVARCHAR(100);
    ALTER TABLE SLS_QUOTATION ALTER COLUMN UPDATED_USER NVARCHAR(100);

    IF COL_LENGTH('SLS_QUOTATION', 'IS_ACTIVE') IS NULL
        ALTER TABLE SLS_QUOTATION ADD IS_ACTIVE BIT DEFAULT 1;
END
GO

-- ==========================================================
-- 7. Clean Primary Keys and Unique Constraints Re-creation
-- ==========================================================
ALTER TABLE SLS_ENQUIRY ADD CONSTRAINT PK_SLS_ENQUIRY PRIMARY KEY (id);
ALTER TABLE SLS_ENQUIRY ADD CONSTRAINT UQ_SLS_ENQUIRY_NO UNIQUE (ENQUIRY_NO);

ALTER TABLE SLS_PRICE_MASTER ADD CONSTRAINT PK_SLS_PRICE_MASTER PRIMARY KEY (id);
ALTER TABLE SLS_PRICE_MASTER ADD CONSTRAINT UQ_SLS_PRICE_MASTER_NO UNIQUE (MASTER_NO);

ALTER TABLE SLS_QUOTATION ADD CONSTRAINT PK_SLS_QUOTATION PRIMARY KEY (id);
ALTER TABLE SLS_QUOTATION ADD CONSTRAINT UQ_SLS_QUOTATION_NO UNIQUE (QUOTATION_NO);
GO

-- ==========================================================
-- 8. Re-establish clean foreign keys
-- ==========================================================
ALTER TABLE SLS_ENQUIRY ADD CONSTRAINT FK_SLS_ENQUIRY_CUSTOMER FOREIGN KEY (CUSTOMER_ID) REFERENCES SLS_CUSTOMER(id);
ALTER TABLE SLS_PRICE_MASTER ADD CONSTRAINT FK_SLS_PRICE_MASTER_CUSTOMER FOREIGN KEY (CUSTOMER_ID) REFERENCES SLS_CUSTOMER(id);
ALTER TABLE SLS_QUOTATION ADD CONSTRAINT FK_SLS_QUOTATION_CUSTOMER FOREIGN KEY (CUSTOMER_ID) REFERENCES SLS_CUSTOMER(id);
GO
