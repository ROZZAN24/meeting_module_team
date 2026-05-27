-- Safe two-step rename helper
IF OBJECT_ID('dbo.sp_RenameTableCasingAndPrefix', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_RenameTableCasingAndPrefix;
GO

CREATE PROCEDURE dbo.sp_RenameTableCasingAndPrefix
    @oldName NVARCHAR(256),
    @newName NVARCHAR(256)
AS
BEGIN
    -- Check if the old table exists and the current metadata casing does not match the desired casing
    IF OBJECT_ID(@oldName, 'U') IS NOT NULL AND 
       (SELECT name FROM sys.tables WHERE object_id = OBJECT_ID(@oldName)) COLLATE Latin1_General_CS_AS <> @newName
    BEGIN
        DECLARE @tempName NVARCHAR(300) = @oldName + '_TEMP';
        EXEC sp_rename @oldName, @tempName;
        EXEC sp_rename @tempName, @newName;
    END
END;
GO

-- 1. Rename legacy "hrm_" tables to uppercase "HR_" prefix
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_category_master', 'HR_CATEGORY_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_department_master', 'HR_DEPARTMENT_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_designation_level', 'HR_DESIGNATION_LEVEL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_designation_master', 'HR_DESIGNATION_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_activity', 'HR_EMPLOYEE_ACTIVITY';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_asset', 'HR_EMPLOYEE_ASSET';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_contact', 'HR_EMPLOYEE_CONTACT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_dependent', 'HR_EMPLOYEE_DEPENDENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_education', 'HR_EMPLOYEE_EDUCATION';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_emergency_contact', 'HR_EMPLOYEE_EMERGENCY_CONTACT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_experience', 'HR_EMPLOYEE_EXPERIENCE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_job_profile', 'HR_EMPLOYEE_JOB_PROFILE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_kyc', 'HR_EMPLOYEE_KYC';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_kyc_document', 'HR_EMPLOYEE_KYC_DOCUMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_master', 'HR_EMPLOYEE_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_passport', 'HR_EMPLOYEE_PASSPORT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_personal_detail', 'HR_EMPLOYEE_PERSONAL_DETAIL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_type_master', 'HR_EMPLOYEE_TYPE_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_grade_detail', 'HR_GRADE_DETAIL';

-- 2. Create Level Master table if missing
IF OBJECT_ID('HR_LEVEL_MASTER', 'U') IS NULL
BEGIN
    IF OBJECT_ID('hrm_level_master', 'U') IS NOT NULL
        EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_level_master', 'HR_LEVEL_MASTER';
    ELSE
    BEGIN
        CREATE TABLE HR_LEVEL_MASTER (
            id BIGINT IDENTITY(1,1) PRIMARY KEY,
            level_name NVARCHAR(100) UNIQUE NOT NULL
        );
        INSERT INTO HR_LEVEL_MASTER (level_name) VALUES ('L1'),('L2'),('L3'),('L4'),('L5'),('L6'),('L7');
    END
END

-- 3. Rename other lowercase tables to uppercase
EXEC dbo.sp_RenameTableCasingAndPrefix 'sys_app_notification', 'SYS_APP_NOTIFICATION';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_app_preference', 'AD_APP_PREFERENCE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_audit_trail', 'AD_AUDIT_TRAIL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_backend_error_log', 'AD_BACKEND_ERROR_LOG';
EXEC dbo.sp_RenameTableCasingAndPrefix 'bos_modules', 'BOS_MODULES';
EXEC dbo.sp_RenameTableCasingAndPrefix 'bos_pages', 'BOS_PAGES';
EXEC dbo.sp_RenameTableCasingAndPrefix 'bos_sub_modules', 'BOS_SUB_MODULES';
EXEC dbo.sp_RenameTableCasingAndPrefix 'bos_user_page_auth', 'BOS_USER_PAGE_AUTH';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_company_credential', 'AD_COMPANY_CREDENTIAL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_contact_master', 'SM_CONTACT_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_currency', 'SM_CURRENCY';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_customer_address', 'SM_CUSTOMER_ADDRESS';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_customer_master', 'SM_CUSTOMER_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_customer_potential', 'SM_CUSTOMER_POTENTIAL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_delivery_terms', 'SM_DELIVERY_TERMS';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_division_master', 'AD_DIVISION_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'employee_manager_mapping', 'EMPLOYEE_MANAGER_MAPPING';
EXEC dbo.sp_RenameTableCasingAndPrefix 'file_traceability_management', 'FILE_TRACEABILITY_MANAGEMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'freight_master', 'FREIGHT_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_migration_audit_log', 'AD_MIGRATION_AUDIT_LOG';
EXEC dbo.sp_RenameTableCasingAndPrefix 'mode_of_despatch', 'MODE_OF_DESPATCH';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_payment_terms', 'SM_PAYMENT_TERMS';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_prefix_credentials', 'AD_PREFIX_CREDENTIALS';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_capacity', 'NPD_CAPACITY';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_item_group', 'NPD_ITEM_GROUP';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_item_subtype', 'NPD_ITEM_SUBTYPE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_item_type', 'NPD_ITEM_TYPE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_model', 'NPD_MODEL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_oem', 'NPD_OEM';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_oem_mapping', 'NPD_OEM_MAPPING';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_process', 'NPD_PROCESS';
EXEC dbo.sp_RenameTableCasingAndPrefix 'npd_wind_farm', 'NPD_WIND_FARM';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_meeting_user_attendance', 'QMS_MEETING_USER_ATTENDANCE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_segment', 'SM_SEGMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_enquiry', 'SM_ENQUIRY';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_price_master', 'SM_PRICE_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_quotation', 'SM_QUOTATION';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_status_master', 'AD_STATUS_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_sub_segment', 'SM_SUB_SEGMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_supplier_master', 'SM_SUPPLIER_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_type_of_service', 'SM_TYPE_OF_SERVICE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_user_credential', 'AD_USER_CREDENTIAL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_user_session_audit', 'AD_USER_SESSION_AUDIT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_user_session_activity', 'AD_USER_SESSION_ACTIVITY';
EXEC dbo.sp_RenameTableCasingAndPrefix 'ad_user_theme_setting', 'AD_USER_THEME_SETTING';

-- 4. Case-rename tables that are already uppercase in Java entities but lowercase in SQL Server
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_checklist_assignment', 'QMS_CHECKLIST_ASSIGNMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_checklist_department', 'QMS_CHECKLIST_DEPARTMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_checklist_master', 'QMS_CHECKLIST_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_checklist_verification', 'QMS_CHECKLIST_VERIFICATION';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_master_checklist', 'QMS_MASTER_CHECKLIST';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_meeting_master', 'QMS_MEETING_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_meeting_schedule', 'QMS_MEETING_SCHEDULE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_meeting_schedule_department', 'QMS_MEETING_SCHEDULE_DEPARTMENT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_meeting_schedule_participant', 'QMS_MEETING_SCHEDULE_PARTICIPANT';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_model_name', 'QMS_MODEL_NAME';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_mom_attendance', 'QMS_MOM_ATTENDANCE';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_mom_detail', 'QMS_MOM_DETAIL';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_mom_master', 'QMS_MOM_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'qms_uom', 'QMS_UOM';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_vendor_customer_master', 'SM_VENDOR_CUSTOMER_MASTER';
EXEC dbo.sp_RenameTableCasingAndPrefix 'sm_vendor_master', 'SM_VENDOR_MASTER';

-- Cleanup helper
DROP PROCEDURE dbo.sp_RenameTableCasingAndPrefix;
GO
