import os
import re

base_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java"

replacements = {
    "com/autonoma/erp/model/AppNotification.java": ("sys_app_notification", "SYS_APP_NOTIFICATION"),
    "com/autonoma/erp/model/admin/AppPreference.java": ("ad_app_preference", "AD_APP_PREFERENCE"),
    "com/autonoma/erp/model/admin/AuditTrail.java": ("ad_audit_trail", "AD_AUDIT_TRAIL"),
    "com/autonoma/erp/model/admin/BackendErrorLog.java": ("ad_backend_error_log", "AD_BACKEND_ERROR_LOG"),
    "com/autonoma/erp/model/admin/BosModule.java": ("bos_modules", "BOS_MODULES"),
    "com/autonoma/erp/model/admin/BosPage.java": ("bos_pages", "BOS_PAGES"),
    "com/autonoma/erp/model/admin/BosSubModule.java": ("bos_sub_modules", "BOS_SUB_MODULES"),
    "com/autonoma/erp/model/admin/BosUserPageAuth.java": ("bos_user_page_auth", "BOS_USER_PAGE_AUTH"),
    "com/autonoma/erp/model/CategoryMaster.java": ("hrm_category_master", "HR_CATEGORY_MASTER"),
    "com/autonoma/erp/model/admin/CompanyCredential.java": ("ad_company_credential", "AD_COMPANY_CREDENTIAL"),
    "com/autonoma/erp/model/ContactMaster.java": ("sm_contact_master", "SM_CONTACT_MASTER"),
    "com/autonoma/erp/model/Currency.java": ("sm_currency", "SM_CURRENCY"),
    "com/autonoma/erp/model/CustomerAddress.java": ("sm_customer_address", "SM_CUSTOMER_ADDRESS"),
    "com/autonoma/erp/model/CustomerMaster.java": ("sm_customer_master", "SM_CUSTOMER_MASTER"),
    "com/autonoma/erp/model/CustomerPotential.java": ("sm_customer_potential", "SM_CUSTOMER_POTENTIAL"),
    "com/autonoma/erp/model/DeliveryTerm.java": ("sm_delivery_terms", "SM_DELIVERY_TERMS"),
    "com/autonoma/erp/model/Department.java": ("hrm_department_master", "HR_DEPARTMENT_MASTER"),
    "com/autonoma/erp/model/Designation.java": ("hrm_designation_master", "HR_DESIGNATION_MASTER"),
    "com/autonoma/erp/model/DesignationLevel.java": ("hrm_designation_level", "HR_DESIGNATION_LEVEL"),
    "com/autonoma/erp/model/Division.java": ("ad_division_master", "AD_DIVISION_MASTER"),
    "com/autonoma/erp/model/EmployeeActivity.java": ("hrm_employee_activity", "HR_EMPLOYEE_ACTIVITY"),
    "com/autonoma/erp/model/EmployeeAsset.java": ("hrm_employee_asset", "HR_EMPLOYEE_ASSET"),
    "com/autonoma/erp/model/EmployeeContact.java": ("hrm_employee_contact", "HR_EMPLOYEE_CONTACT"),
    "com/autonoma/erp/model/EmployeeDependent.java": ("hrm_employee_dependent", "HR_EMPLOYEE_DEPENDENT"),
    "com/autonoma/erp/model/EmployeeEducation.java": ("hrm_employee_education", "HR_EMPLOYEE_EDUCATION"),
    "com/autonoma/erp/model/EmployeeEmergencyContact.java": ("hrm_employee_emergency_contact", "HR_EMPLOYEE_EMERGENCY_CONTACT"),
    "com/autonoma/erp/model/EmployeeExperience.java": ("hrm_employee_experience", "HR_EMPLOYEE_EXPERIENCE"),
    "com/autonoma/erp/model/EmployeeJobProfile.java": ("hrm_employee_job_profile", "HR_EMPLOYEE_JOB_PROFILE"),
    "com/autonoma/erp/model/EmployeeKyc.java": ("hrm_employee_kyc", "HR_EMPLOYEE_KYC"),
    "com/autonoma/erp/model/EmployeeKycDocument.java": ("hrm_employee_kyc_document", "HR_EMPLOYEE_KYC_DOCUMENT"),
    "com/autonoma/erp/model/EmployeeManagerMapping.java": ("employee_manager_mapping", "EMPLOYEE_MANAGER_MAPPING"),
    "com/autonoma/erp/model/EmployeeMaster.java": ("hrm_employee_master", "HR_EMPLOYEE_MASTER"),
    "com/autonoma/erp/model/EmployeePassport.java": ("hrm_employee_passport", "HR_EMPLOYEE_PASSPORT"),
    "com/autonoma/erp/model/EmployeePersonalDetail.java": ("hrm_employee_personal_detail", "HR_EMPLOYEE_PERSONAL_DETAIL"),
    "com/autonoma/erp/model/EmployeeTypeMaster.java": ("hrm_employee_type_master", "HR_EMPLOYEE_TYPE_MASTER"),
    "com/autonoma/erp/model/FileTraceabilityManagement.java": ("file_traceability_management", "FILE_TRACEABILITY_MANAGEMENT"),
    "com/autonoma/erp/model/Freight.java": ("freight_master", "FREIGHT_MASTER"),
    "com/autonoma/erp/model/Gradedetails.java": ("hrm_grade_detail", "HR_GRADE_DETAIL"),
    "com/autonoma/erp/model/LevelMaster.java": ("hrm_level_master", "HR_LEVEL_MASTER"),
    "com/autonoma/erp/model/admin/MigrationAuditLog.java": ("ad_migration_audit_log", "AD_MIGRATION_AUDIT_LOG"),
    "com/autonoma/erp/model/ModeOfDespatch.java": ("mode_of_despatch", "MODE_OF_DESPATCH"),
    "com/autonoma/erp/model/PaymentTerm.java": ("sm_payment_terms", "SM_PAYMENT_TERMS"),
    "com/autonoma/erp/model/admin/PrefixCredential.java": ("ad_prefix_credentials", "AD_PREFIX_CREDENTIALS"),
    "com/autonoma/erp/model/ProductCapacity.java": ("npd_capacity", "NPD_CAPACITY"),
    "com/autonoma/erp/model/ProductItemGroup.java": ("npd_item_group", "NPD_ITEM_GROUP"),
    "com/autonoma/erp/model/ProductItemSubtype.java": ("npd_item_subtype", "NPD_ITEM_SUBTYPE"),
    "com/autonoma/erp/model/ProductItemType.java": ("npd_item_type", "NPD_ITEM_TYPE"),
    "com/autonoma/erp/model/ProductModel.java": ("npd_model", "NPD_MODEL"),
    "com/autonoma/erp/model/ProductOem.java": ("npd_oem", "NPD_OEM"),
    "com/autonoma/erp/model/ProductOemMapping.java": ("npd_oem_mapping", "NPD_OEM_MAPPING"),
    "com/autonoma/erp/model/ProductProcess.java": ("npd_process", "NPD_PROCESS"),
    "com/autonoma/erp/model/ProductWindFarm.java": ("npd_wind_farm", "NPD_WIND_FARM"),
    "com/autonoma/erp/model/QmsMeetingUserAttendance.java": ("qms_meeting_user_attendance", "QMS_MEETING_USER_ATTENDANCE"),
    "com/autonoma/erp/model/Segment.java": ("sm_segment", "SM_SEGMENT"),
    "com/autonoma/erp/model/SmEnquiry.java": ("sm_enquiry", "SM_ENQUIRY"),
    "com/autonoma/erp/model/SmPriceMaster.java": ("sm_price_master", "SM_PRICE_MASTER"),
    "com/autonoma/erp/model/SmQuotation.java": ("sm_quotation", "SM_QUOTATION"),
    "com/autonoma/erp/model/StatusMaster.java": ("ad_status_master", "AD_STATUS_MASTER"),
    "com/autonoma/erp/model/SubSegment.java": ("sm_sub_segment", "SM_SUB_SEGMENT"),
    "com/autonoma/erp/model/SupplierMaster.java": ("sm_supplier_master", "SM_SUPPLIER_MASTER"),
    "com/autonoma/erp/model/TypeOfService.java": ("sm_type_of_service", "SM_TYPE_OF_SERVICE"),
    "com/autonoma/erp/model/admin/UserCredential.java": ("ad_user_credential", "AD_USER_CREDENTIAL"),
    "com/autonoma/erp/model/admin/UserSession.java": ("ad_user_session_audit", "AD_USER_SESSION_AUDIT"),
    "com/autonoma/erp/model/admin/UserSessionActivity.java": ("ad_user_session_activity", "AD_USER_SESSION_ACTIVITY"),
    "com/autonoma/erp/model/admin/UserThemeSetting.java": ("ad_user_theme_setting", "AD_USER_THEME_SETTING")
}

for file_rel, (old_tbl, new_tbl) in replacements.items():
    filepath = os.path.join(base_dir, file_rel)
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        continue
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace @Table(name = "old_tbl") or @Table(name="old_tbl") or @Table(name = 'old_tbl')
    pattern = rf'@Table\(\s*name\s*=\s*"{re.escape(old_tbl)}"\s*\)'
    new_pattern = f'@Table(name = "{new_tbl}")'
    
    modified, count = re.subn(pattern, new_pattern, content)
    
    if count == 0:
        # Try finding it without name= part in case it's just @Table("old_tbl") or matching case insensitively
        pattern_simple = rf'@Table\(\s*"{re.escape(old_tbl)}"\s*\)'
        modified, count = re.subn(pattern_simple, new_pattern, content)
        
    if count == 0:
        # Let's check if the table name is already capitalized in the file
        pattern_already_new = rf'@Table\(\s*name\s*=\s*"{re.escape(new_tbl)}"\s*\)'
        if re.search(pattern_already_new, content):
            print(f"Already standard: {file_rel}")
            continue
        print(f"WARNING: Could not find @Table with name '{old_tbl}' in {file_rel}")
        # Show actual @Table line
        match_table = re.search(r'@Table\([^\)]+\)', content)
        if match_table:
            print(f"  Found instead: {match_table.group(0)}")
        continue
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(modified)
    print(f"Updated {file_rel} -> table set to {new_tbl}")

print("Done updates!")
