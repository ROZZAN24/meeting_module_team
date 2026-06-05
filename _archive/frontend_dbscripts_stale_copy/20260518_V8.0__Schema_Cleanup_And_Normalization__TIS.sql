-- PART 1: Drop Empty Legacy Tables
IF OBJECT_ID('DesignationMaster', 'U') IS NOT NULL DROP TABLE DesignationMaster;
IF OBJECT_ID('EmployeeMaster', 'U') IS NOT NULL DROP TABLE EmployeeMaster;
IF OBJECT_ID('HRM_DESIG_LEVEL', 'U') IS NOT NULL DROP TABLE HRM_DESIG_LEVEL;
IF OBJECT_ID('HRM_GRADE_DETAILS', 'U') IS NOT NULL DROP TABLE HRM_GRADE_DETAILS;
IF OBJECT_ID('HRM_LEVEL_MASTER', 'U') IS NOT NULL DROP TABLE HRM_LEVEL_MASTER;
IF OBJECT_ID('HRM_TYPE_MASTER', 'U') IS NOT NULL DROP TABLE HRM_TYPE_MASTER;
GO

-- PART 2: Rename Uppercase to Lowercase
-- Note: SQL Server sp_rename is used here. 
-- Even if case-insensitive, it updates the metadata representation.

IF OBJECT_ID('HRM_CATEGORY_MASTER', 'U') IS NOT NULL EXEC sp_rename 'HRM_CATEGORY_MASTER', 'hrm_category_master';
IF OBJECT_ID('HRM_DEPARTMENT_MASTER', 'U') IS NOT NULL EXEC sp_rename 'HRM_DEPARTMENT_MASTER', 'hrm_department_master';
IF OBJECT_ID('SM_CONTACT_MASTER', 'U') IS NOT NULL EXEC sp_rename 'SM_CONTACT_MASTER', 'sm_contact_master';
IF OBJECT_ID('SM_CURRENCY', 'U') IS NOT NULL EXEC sp_rename 'SM_CURRENCY', 'sm_currency';
IF OBJECT_ID('SM_CUSTOMER_ADDRESS', 'U') IS NOT NULL EXEC sp_rename 'SM_CUSTOMER_ADDRESS', 'sm_customer_address';
IF OBJECT_ID('SM_CUSTOMER_MASTER', 'U') IS NOT NULL EXEC sp_rename 'SM_CUSTOMER_MASTER', 'sm_customer_master';
IF OBJECT_ID('SM_DELIVERY_TERMS', 'U') IS NOT NULL EXEC sp_rename 'SM_DELIVERY_TERMS', 'sm_delivery_terms';
IF OBJECT_ID('SM_PAYMENT_TERMS', 'U') IS NOT NULL EXEC sp_rename 'SM_PAYMENT_TERMS', 'sm_payment_terms';
IF OBJECT_ID('SM_SEGMENT', 'U') IS NOT NULL EXEC sp_rename 'SM_SEGMENT', 'sm_segment';
IF OBJECT_ID('SM_SUB_SEGMENT', 'U') IS NOT NULL EXEC sp_rename 'SM_SUB_SEGMENT', 'sm_sub_segment';
IF OBJECT_ID('SM_SUBCONTRACTOR_MASTER', 'U') IS NOT NULL EXEC sp_rename 'SM_SUBCONTRACTOR_MASTER', 'sm_subcontractor_master';
IF OBJECT_ID('SM_SUPPLIER_MASTER', 'U') IS NOT NULL EXEC sp_rename 'SM_SUPPLIER_MASTER', 'sm_supplier_master';
IF OBJECT_ID('SM_TYPE_OF_SERVICE', 'U') IS NOT NULL EXEC sp_rename 'SM_TYPE_OF_SERVICE', 'sm_type_of_service';
IF OBJECT_ID('SM_VENDOR_MASTER', 'U') IS NOT NULL EXEC sp_rename 'SM_VENDOR_MASTER', 'sm_vendor_master';
IF OBJECT_ID('STATUS_MASTER', 'U') IS NOT NULL EXEC sp_rename 'STATUS_MASTER', 'status_master';
IF OBJECT_ID('PRODUCT_MASTER', 'U') IS NOT NULL EXEC sp_rename 'PRODUCT_MASTER', 'product_master';
IF OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT', 'U') IS NOT NULL EXEC sp_rename 'QMS_CHECKLIST_ASSIGNMENT', 'qms_checklist_assignment';
IF OBJECT_ID('QMS_CHECKLIST_VERIFICATION', 'U') IS NOT NULL EXEC sp_rename 'QMS_CHECKLIST_VERIFICATION', 'qms_checklist_verification';
IF OBJECT_ID('QMS_MASTER_CHECKLIST', 'U') IS NOT NULL EXEC sp_rename 'QMS_MASTER_CHECKLIST', 'qms_master_checklist';
IF OBJECT_ID('ERP_EXECUTED_SCRIPTS', 'U') IS NOT NULL EXEC sp_rename 'ERP_EXECUTED_SCRIPTS', 'erp_executed_scripts';
IF OBJECT_ID('ERP_FAILED_SCRIPTS', 'U') IS NOT NULL EXEC sp_rename 'ERP_FAILED_SCRIPTS', 'erp_failed_scripts';
GO
