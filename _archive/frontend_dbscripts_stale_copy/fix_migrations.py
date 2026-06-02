import os
import re

dir_path = "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/db/migration"
files = sorted([f for f in os.listdir(dir_path) if f.startswith('V') and f.endswith('.sql')])

# Identify duplicates and rename them to use .1, .2 etc
seen_versions = {}
for f in files:
    match = re.match(r'V([\d\._]+)__', f)
    if match:
        version = match.group(1).replace('_', '.')
        # Normalize: remove trailing dots or handle multiple dots
        # For simplicity, we will just make them sequential based on their current sorted order
        pass

# Actually, let's just make a mapping of old name to new name
# and ensure they are strictly sequential: V1.0, V1.1, ... V3.5, V3.5.1, V3.6, V3.6.1 ...
new_files = []
current_base = ""
sub_version = 0

# We want to preserve the order but fix the version strings
for f in files:
    match = re.match(r'V([\d\.]+)(_[\d]+)?__(.*)', f)
    if match:
        base_version = match.group(1)
        suffix = match.group(2)
        description = match.group(3)
        
        # If we see a version like 3.4_1, let's make it 3.4.1
        # If we see two 3.5s, make them 3.5 and 3.5.1
        
        # This is getting complicated. Let's just do a manual mapping for the known duplicates.
        pass

# Manual mapping of duplicates to avoid collision
mapping = {
    "V3.5__Standardize_Audit_Schedule_Column_Names.sql": "V3.5.1__Standardize_Audit_Schedule_Column_Names.sql",
    "V3.5_1__Standardize_Audit_Schedule_Column_Names.sql": "V3.5.1__Standardize_Audit_Schedule_Column_Names.sql",
    "V3.6__Normalize_Schema_And_Drop_Duplicates.sql": "V3.6.1__Normalize_Schema_And_Drop_Duplicates.sql",
    "V3.6_1__Normalize_Schema_And_Drop_Duplicates.sql": "V3.6.1__Normalize_Schema_And_Drop_Duplicates.sql",
    "V3.7__Standardize_Remaining_Audit_Schedule_Columns.sql": "V3.7.1__Standardize_Remaining_Audit_Schedule_Columns.sql",
    "V3.7_1__Standardize_Remaining_Audit_Schedule_Columns.sql": "V3.7.1__Standardize_Remaining_Audit_Schedule_Columns.sql",
    "V3.9__Normalize_Audit_Observations_Schema.sql": "V3.9.1__Normalize_Audit_Observations_Schema.sql",
    "V3.9_1__Normalize_Audit_Observations_Schema.sql": "V3.9.1__Normalize_Audit_Observations_Schema.sql",
    "V3.4_1__Create_User_Session_Audit.sql": "V3.4.1__Create_User_Session_Audit.sql"
}

for old, new in mapping.items():
    old_path = os.path.join(dir_path, old)
    new_path = os.path.join(dir_path, new)
    if os.path.exists(old_path):
        print(f"Renaming {old} to {new}")
        os.rename(old_path, new_path)
