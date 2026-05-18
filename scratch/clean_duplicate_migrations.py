import os

migration_dir = r"c:\Users\bpras\Desktop\Autonoma_ERP-main\Autonoma_ERP-main\autonoma-backend\src\main\resources\db\migration"

files_to_delete = [
    "V3.4_1__Create_User_Session_Audit.sql",
    "V3.5__Standardize_Audit_Schedule_Column_Names.sql",
    "V3.6__Normalize_Schema_And_Drop_Duplicates.sql",
    "V3.7__Standardize_Remaining_Audit_Schedule_Columns.sql",
    "V3.9__Normalize_Audit_Observations_Schema.sql",
    "V4.18__Add_Is_Bos_Admin_To_User_Credential.sql",
    "V4.19__Add_Lic_Exp_Remainder_Days.sql",
    "V6.0__Standardize_Audit_Infrastructure_And_Add_Masters.sql"
]

files_to_rename = {
    "V4.18__Create_Audit_Trail_Table.sql": "V4.18.2__Create_Audit_Trail_Table.sql",
    "V4.19__Create_User_Session_Activity.sql": "V4.19.2__Create_User_Session_Activity.sql",
    "V4.20__Add_Idle_Tracking.sql": "V4.20.2__Add_Idle_Tracking.sql",
    "V4.21__Add_Restore_Enable_Days_And_Audit_Restored_Fields.sql": "V4.21.2__Add_Restore_Enable_Days_And_Audit_Restored_Fields.sql",
    "V4.22__Fix_Null_Restore_Days.sql": "V4.22.2__Fix_Null_Restore_Days.sql",
    "V14.0__Standardize_Segment_Audit_Columns.sql": "V14.0.2__Standardize_Segment_Audit_Columns.sql"
}

# Perform deletions
for filename in files_to_delete:
    filepath = os.path.join(migration_dir, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        print(f"DELETED duplicate: {filename}")
    else:
        print(f"Already gone/not found: {filename}")

# Perform renames
for old_name, new_name in files_to_rename.items():
    old_filepath = os.path.join(migration_dir, old_name)
    new_filepath = os.path.join(migration_dir, new_name)
    if os.path.exists(old_filepath):
        if os.path.exists(new_filepath):
            os.remove(new_filepath) # overwrite if exists
        os.rename(old_filepath, new_filepath)
        print(f"RENAMED collision: {old_name} -> {new_name}")
    else:
        print(f"Not found for rename: {old_name}")

print("Clean-up and version renaming fully completed!")
