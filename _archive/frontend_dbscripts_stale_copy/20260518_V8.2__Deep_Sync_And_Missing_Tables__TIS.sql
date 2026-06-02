-- V8.2 Deep Cleanup and Sync
-- Synchronize DB schema with Java JPA Entities to resolve missing tables and column discrepancies.
USE [AUTONOMA];

-- 1. Create sm_enquiry table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sm_enquiry]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sm_enquiry] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [enquiry_no] NVARCHAR(50) NOT NULL,
        [enquiry_date] DATE,
        [customer_name] NVARCHAR(200),
        [CUSTOMER_ID] BIGINT,
        [contact_person] NVARCHAR(200),
        [email] NVARCHAR(200),
        [phone] NVARCHAR(50),
        [subject] NVARCHAR(500),
        [requirements] NVARCHAR(MAX),
        [source] NVARCHAR(100),
        [priority] NVARCHAR(50) DEFAULT 'Medium',
        [ocr_document_path] NVARCHAR(500),
        [ocr_extracted_text] NVARCHAR(MAX),
        [ocr_confidence] NVARCHAR(10),
        [status] NVARCHAR(50) DEFAULT 'Open',
        [remarks] NVARCHAR(MAX),
        [created_by] NVARCHAR(100),
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_by] NVARCHAR(100),
        [updated_at] DATETIME
    );
END

-- 2. Create sm_quotation table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sm_quotation]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sm_quotation] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [quotation_no] NVARCHAR(50) NOT NULL,
        [quotation_date] DATE,
        [enquiry_ref] NVARCHAR(50),
        [customer_name] NVARCHAR(200),
        [CUSTOMER_ID] BIGINT,
        [contact_person] NVARCHAR(200),
        [product_name] NVARCHAR(200),
        [description] NVARCHAR(MAX),
        [quantity] NVARCHAR(50),
        [unit_price] NVARCHAR(50),
        [total_amount] NVARCHAR(50),
        [currency] NVARCHAR(10) DEFAULT 'INR',
        [validity_period] NVARCHAR(50),
        [delivery_terms] NVARCHAR(500),
        [payment_terms] NVARCHAR(500),
        [ocr_document_path] NVARCHAR(500),
        [ocr_extracted_text] NVARCHAR(MAX),
        [ocr_confidence] NVARCHAR(10),
        [status] NVARCHAR(50) DEFAULT 'Draft',
        [remarks] NVARCHAR(MAX),
        [created_by] NVARCHAR(100),
        [created_at] DATETIME DEFAULT GETDATE(),
        [updated_by] NVARCHAR(100),
        [updated_at] DATETIME
    );
END

-- 3. Create HRM Lookup Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_employee_type_master]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[hrm_employee_type_master] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [type_name] NVARCHAR(100) UNIQUE NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_category_master]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[hrm_category_master] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [category_name] NVARCHAR(100) UNIQUE NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[hrm_level_master]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[hrm_level_master] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [level_name] NVARCHAR(100) UNIQUE NOT NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ad_status_master]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ad_status_master] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) UNIQUE NOT NULL
    );
END

-- 4. Fix hrm_designation_master discrepancies
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationcode')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designation_code')
    EXEC sp_rename 'hrm_designation_master.designationcode', 'designation_code', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designationname')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'designation_name')
    EXEC sp_rename 'hrm_designation_master.designationname', 'designation_name', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'subcategorylevel')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'sub_category_level')
    EXEC sp_rename 'hrm_designation_master.subcategorylevel', 'sub_category_level', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'appearincompetency')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'appear_in_competency')
    EXEC sp_rename 'hrm_designation_master.appearincompetency', 'appear_in_competency', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'displayslno')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'display_sl_no')
    EXEC sp_rename 'hrm_designation_master.displayslno', 'display_sl_no', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'jobdescription')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'job_description')
    EXEC sp_rename 'hrm_designation_master.jobdescription', 'job_description', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'orgseqno')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'org_seq_no')
    EXEC sp_rename 'hrm_designation_master.orgseqno', 'org_seq_no', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'budgetedpositions')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'budgeted_positions')
    EXEC sp_rename 'hrm_designation_master.budgetedpositions', 'budgeted_positions', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'createdat')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'created_at')
    EXEC sp_rename 'hrm_designation_master.createdat', 'created_at', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updatedat')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('hrm_designation_master') AND name = 'updated_at')
    EXEC sp_rename 'hrm_designation_master.updatedat', 'updated_at', 'COLUMN';

-- 5. Fix sm_supplier_master discrepancies
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'GSTIN') 
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'GST_NO')
    EXEC sp_rename 'sm_supplier_master.GSTIN', 'GST_NO', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ISO_NUMBER')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ISO_NO')
    EXEC sp_rename 'sm_supplier_master.ISO_NUMBER', 'ISO_NO', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ISO_EXPIRY')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'ISO_EXPIRY_DATE')
    EXEC sp_rename 'sm_supplier_master.ISO_EXPIRY', 'ISO_EXPIRY_DATE', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'FILE_UPLOAD')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'UPLOAD_FILES')
    EXEC sp_rename 'sm_supplier_master.FILE_UPLOAD', 'UPLOAD_FILES', 'COLUMN';

-- 6. Fix sm_subcontractor_master discrepancies
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'GSTIN')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'GST_NO')
    EXEC sp_rename 'sm_subcontractor_master.GSTIN', 'GST_NO', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'ISO_NUMBER')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'ISO_NO')
    EXEC sp_rename 'sm_subcontractor_master.ISO_NUMBER', 'ISO_NO', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'ISO_EXPIRY')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'ISO_EXPIRY_DATE')
    EXEC sp_rename 'sm_subcontractor_master.ISO_EXPIRY', 'ISO_EXPIRY_DATE', 'COLUMN';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'FILE_UPLOAD')
   AND NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_subcontractor_master') AND name = 'UPLOAD_FILES')
    EXEC sp_rename 'sm_subcontractor_master.FILE_UPLOAD', 'UPLOAD_FILES', 'COLUMN';

-- 7. Add missing columns for Supplier/Subcontractor Master
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'SUPPLIER_PRINT_NAME')
    ALTER TABLE sm_supplier_master ADD SUPPLIER_PRINT_NAME NVARCHAR(200);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'LEDGER_NAME')
    ALTER TABLE sm_supplier_master ADD LEDGER_NAME NVARCHAR(200);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'MOBILE_NO')
    ALTER TABLE sm_supplier_master ADD MOBILE_NO NVARCHAR(20);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'EMAIL_ID')
    ALTER TABLE sm_supplier_master ADD EMAIL_ID NVARCHAR(100);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'PAN_NO')
    ALTER TABLE sm_supplier_master ADD PAN_NO NVARCHAR(50);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'MSME_NO')
    ALTER TABLE sm_supplier_master ADD MSME_NO NVARCHAR(50);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'APPROVED_SUPPLIER')
    ALTER TABLE sm_supplier_master ADD APPROVED_SUPPLIER NVARCHAR(10);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'PRIME_SUPPLIER')
    ALTER TABLE sm_supplier_master ADD PRIME_SUPPLIER NVARCHAR(10);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'FREIGHT_REQUIRED')
    ALTER TABLE sm_supplier_master ADD FREIGHT_REQUIRED NVARCHAR(10);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'DUE_DAYS')
    ALTER TABLE sm_supplier_master ADD DUE_DAYS NVARCHAR(50);
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_supplier_master') AND name = 'IS_AUDITOR_CONSULTANT')
    ALTER TABLE sm_supplier_master ADD IS_AUDITOR_CONSULTANT NVARCHAR(10);

-- 8. Audit Standardization for all touched tables
DECLARE @TableName NVARCHAR(255);
DECLARE @TableCursor CURSOR;
SET @TableCursor = CURSOR FOR SELECT name FROM sys.tables WHERE name IN ('sm_enquiry', 'sm_quotation', 'sm_supplier_master', 'sm_subcontractor_master', 'hrm_designation_master');
OPEN @TableCursor; FETCH NEXT FROM @TableCursor INTO @TableName;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_by') EXEC('ALTER TABLE ' + @TableName + ' ADD created_by NVARCHAR(100)');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'created_at') EXEC('ALTER TABLE ' + @TableName + ' ADD created_at DATETIME');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_by') EXEC('ALTER TABLE ' + @TableName + ' ADD updated_by NVARCHAR(100)');
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@TableName) AND name = 'updated_at') EXEC('ALTER TABLE ' + @TableName + ' ADD updated_at DATETIME');
    FETCH NEXT FROM @TableCursor INTO @TableName;
END;
CLOSE @TableCursor; DEALLOCATE @TableCursor;
