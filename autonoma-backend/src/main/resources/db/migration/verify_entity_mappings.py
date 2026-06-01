import os
import re

model_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java/com/autonoma/erp/model"
migration_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/resources/db/migration"

# Regex patterns
table_pattern = re.compile(r"@Table\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)
column_pattern = re.compile(r"@Column\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)
join_column_pattern = re.compile(r"@JoinColumn\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)

# Extract mappings from entities
entity_mappings = {}
for root, dirs, files in os.walk(model_dir):
    for file in files:
        if file.endswith(".java"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
                table_match = table_pattern.search(content)
                if not table_match:
                    continue
                table_name = table_match.group(1).upper()
                
                columns = set(column_pattern.findall(content))
                join_columns = set(join_column_pattern.findall(content))
                
                all_cols = {c.upper() for c in columns.union(join_columns)}
                entity_mappings[table_name] = {
                    "file": file,
                    "columns": all_cols
                }

# Combine all migration script contents to search for renames
migration_content = ""
for root, dirs, files in os.walk(migration_dir):
    for file in files:
        if file.endswith(".sql"):
            with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                migration_content += "\n" + f.read()

# Let's check which entity tables are renamed or created in migrations
print(f"Total JPA Entities mapped to tables: {len(entity_mappings)}")

# Simple check: let's verify if the tables expected by entities are present in migration scripts
print("\n--- MAPPING VERIFICATION ---")
missing_tables = []
for table, data in sorted(entity_mappings.items()):
    # Check if table name exists in migration scripts
    if table not in migration_content.upper():
        missing_tables.append(table)

print(f"\nEntity tables NOT found in modular migration scripts ({len(missing_tables)}):")
for t in missing_tables:
    print(f"  - Table: {t} (Entity: {entity_mappings[t]['file']})")

# Let's inspect some specific columns from entities to see if they are referenced
mismatched_columns = {}
for table, data in sorted(entity_mappings.items()):
    if table in missing_tables:
        continue
    
    # Let's check if the columns specified in Java Entity are in the migrations
    # Since migrations might alter a table without mentioning every single column (if it was created in legacy),
    # we should check if there is any column renaming mismatch.
    # For example, if a column is PERSONAL_EMAIL in Java, let's see if we see it in migrations or if we see email_id.
    pass
