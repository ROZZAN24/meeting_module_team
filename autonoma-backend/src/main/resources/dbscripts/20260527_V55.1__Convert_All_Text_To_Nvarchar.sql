-- Convert TEXT to NVARCHAR(MAX)
DECLARE @sql NVARCHAR(MAX) = '';

-- sm_customer_address
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_customer_address') AND name = 'address' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_customer_address ALTER COLUMN address NVARCHAR(MAX); ';

-- SM_CUSTOMER_MASTER
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SM_CUSTOMER_MASTER') AND name = 'address' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE SM_CUSTOMER_MASTER ALTER COLUMN address NVARCHAR(MAX); ';

-- QMS_CHECKLIST_MASTER
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST_MASTER') AND name = 'DESCRIPTION' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE QMS_CHECKLIST_MASTER ALTER COLUMN DESCRIPTION NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST_MASTER') AND name = 'AMENDMENT_REASON' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE QMS_CHECKLIST_MASTER ALTER COLUMN AMENDMENT_REASON NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST_MASTER') AND name = 'UPLOADED_FILES' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE QMS_CHECKLIST_MASTER ALTER COLUMN UPLOADED_FILES NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QMS_CHECKLIST_MASTER') AND name = 'SCANNED_FILES' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE QMS_CHECKLIST_MASTER ALTER COLUMN SCANNED_FILES NVARCHAR(MAX); ';

-- sm_enquiry
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_enquiry') AND name = 'requirements' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_enquiry ALTER COLUMN requirements NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_enquiry') AND name = 'ocr_extracted_text' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_enquiry ALTER COLUMN ocr_extracted_text NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_enquiry') AND name = 'remarks' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_enquiry ALTER COLUMN remarks NVARCHAR(MAX); ';

-- sm_price_master
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_price_master') AND name = 'terms_and_conditions' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_price_master ALTER COLUMN terms_and_conditions NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_price_master') AND name = 'ocr_extracted_text' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_price_master ALTER COLUMN ocr_extracted_text NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_price_master') AND name = 'remarks' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_price_master ALTER COLUMN remarks NVARCHAR(MAX); ';

-- sm_quotation
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_quotation') AND name = 'description' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_quotation ALTER COLUMN description NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_quotation') AND name = 'ocr_extracted_text' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_quotation ALTER COLUMN ocr_extracted_text NVARCHAR(MAX); ';
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('sm_quotation') AND name = 'remarks' AND system_type_id IN (35, 99))
    SET @sql += 'ALTER TABLE sm_quotation ALTER COLUMN remarks NVARCHAR(MAX); ';

EXEC sp_executesql @sql;
