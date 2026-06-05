def fix_table_renames(file_path):
    print(f"Fixing table renames in: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. HR_EMPLOYEE_PERSONAL Block
    old_personal_block = """IF OBJECT_ID('HR_EMPLOYEE_PERSONAL_DETAIL', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'HR_EMPLOYEE_PERSONAL_DETAIL', 'HR_EMPLOYEE_PERSONAL';
END
GO
IF OBJECT_ID('hrm_employee_personal_detail', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'hrm_employee_personal_detail', 'HR_EMPLOYEE_PERSONAL';
END
GO"""

    new_personal_block = """IF OBJECT_ID('dbo.sp_RenameTableCasingAndPrefix', 'P') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameTableCasingAndPrefix 'HR_EMPLOYEE_PERSONAL_DETAIL', 'HR_EMPLOYEE_PERSONAL';
    EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_personal_detail', 'HR_EMPLOYEE_PERSONAL';
END
ELSE
BEGIN
    IF OBJECT_ID('HR_EMPLOYEE_PERSONAL_DETAIL', 'U') IS NOT NULL AND OBJECT_ID('HR_EMPLOYEE_PERSONAL', 'U') IS NULL
        EXEC sp_rename 'HR_EMPLOYEE_PERSONAL_DETAIL', 'HR_EMPLOYEE_PERSONAL';
    IF OBJECT_ID('hrm_employee_personal_detail', 'U') IS NOT NULL AND OBJECT_ID('HR_EMPLOYEE_PERSONAL', 'U') IS NULL
        EXEC sp_rename 'hrm_employee_personal_detail', 'HR_EMPLOYEE_PERSONAL';
END
GO"""

    # 2. HR_EMPLOYEE_CONTACT Block
    old_contact_block = """IF OBJECT_ID('hrm_employee_contact', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'hrm_employee_contact', 'HR_EMPLOYEE_CONTACT';
END
GO"""

    new_contact_block = """IF OBJECT_ID('dbo.sp_RenameTableCasingAndPrefix', 'P') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameTableCasingAndPrefix 'hrm_employee_contact', 'HR_EMPLOYEE_CONTACT';
END
ELSE
BEGIN
    IF OBJECT_ID('hrm_employee_contact', 'U') IS NOT NULL AND OBJECT_ID('HR_EMPLOYEE_CONTACT', 'U') IS NULL
        EXEC sp_rename 'hrm_employee_contact', 'HR_EMPLOYEE_CONTACT';
END
GO"""

    # 3. HR_EMPLOYEE_MANAGER_MAPPING Block
    old_mapping_block = """IF OBJECT_ID('EMPLOYEE_MANAGER_MAPPING', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'EMPLOYEE_MANAGER_MAPPING', 'HR_EMPLOYEE_MANAGER_MAPPING';
END
GO"""

    new_mapping_block = """IF OBJECT_ID('dbo.sp_RenameTableCasingAndPrefix', 'P') IS NOT NULL
BEGIN
    EXEC dbo.sp_RenameTableCasingAndPrefix 'EMPLOYEE_MANAGER_MAPPING', 'HR_EMPLOYEE_MANAGER_MAPPING';
END
ELSE
BEGIN
    IF OBJECT_ID('EMPLOYEE_MANAGER_MAPPING', 'U') IS NOT NULL AND OBJECT_ID('HR_EMPLOYEE_MANAGER_MAPPING', 'U') IS NULL
        EXEC sp_rename 'EMPLOYEE_MANAGER_MAPPING', 'HR_EMPLOYEE_MANAGER_MAPPING';
END
GO"""

    # Apply replacements
    modified = False
    if old_personal_block in content:
        content = content.replace(old_personal_block, new_personal_block)
        print("  Replaced HR_EMPLOYEE_PERSONAL block.")
        modified = True
    else:
        print("  HR_EMPLOYEE_PERSONAL block NOT found or already replaced.")
        
    if old_contact_block in content:
        content = content.replace(old_contact_block, new_contact_block)
        print("  Replaced HR_EMPLOYEE_CONTACT block.")
        modified = True
    else:
        print("  HR_EMPLOYEE_CONTACT block NOT found or already replaced.")

    if old_mapping_block in content:
        content = content.replace(old_mapping_block, new_mapping_block)
        print("  Replaced HR_EMPLOYEE_MANAGER_MAPPING block.")
        modified = True
    else:
        print("  HR_EMPLOYEE_MANAGER_MAPPING block NOT found or already replaced.")

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Saved changes to: {file_path}")
    else:
        print(f"  No modifications required for: {file_path}")

if __name__ == '__main__':
    files = [
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/db/migration/employee/V004__Employee_Module.sql",
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/dbscripts/v_next/V004__Employee_Module.sql"
    ]
    for f in files:
        fix_table_renames(f)
