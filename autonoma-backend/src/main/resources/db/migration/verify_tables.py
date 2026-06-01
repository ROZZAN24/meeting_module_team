import os
import re

legacy_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/resources/dbscripts"
new_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/resources/db/migration"

def extract_created_tables(directory, recursive=False):
    create_table_regex = re.compile(r"CREATE\s+TABLE\s+([\[\]a-zA-Z0-9_]+)", re.IGNORECASE)
    tables = {}
    
    for root, dirs, files in os.walk(directory):
        if not recursive and root != directory:
            continue
        for file in files:
            if file.endswith(".sql"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    matches = create_table_regex.findall(content)
                    for match in matches:
                        clean_name = match.replace("[", "").replace("]", "").strip().upper()
                        # Track which files define/modify this table
                        if clean_name not in tables:
                            tables[clean_name] = []
                        tables[clean_name].append(os.path.basename(file_path))
    return tables

legacy_tables = extract_created_tables(legacy_dir, recursive=False)
new_tables = extract_created_tables(new_dir, recursive=True)

print(f"Unique tables created in Legacy migrations: {len(legacy_tables)}")
print(f"Unique tables created in New migrations: {len(new_tables)}")

# Check for tables in legacy but not in new
missing_in_new = sorted([t for t in legacy_tables if t not in new_tables])
print(f"\nTables present in Legacy but MISSING in New ({len(missing_in_new)}):")
for t in missing_in_new:
    print(f"  - {t} (defined in {legacy_tables[t]})")

# Check for tables in new but not in legacy
extra_in_new = sorted([t for t in new_tables if t not in legacy_tables])
print(f"\nTables present in New but NOT in Legacy ({len(extra_in_new)}):")
for t in extra_in_new:
    print(f"  - {t} (defined in {new_tables[t]})")
