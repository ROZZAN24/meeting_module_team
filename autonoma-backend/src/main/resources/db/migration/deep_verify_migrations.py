import os
import re

model_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java/com/autonoma/erp/model"
migration_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/resources/db/migration"
legacy_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/resources/dbscripts"

# Regex patterns
table_pattern = re.compile(r"@Table\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)
column_pattern = re.compile(r"@Column\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)
join_column_pattern = re.compile(r"@JoinColumn\s*\(\s*name\s*=\s*\"([^\"]+)\"", re.IGNORECASE)

# Step 1: Parse all JPA Entities
print("Step 1: Parsing JPA Entities...")
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
                # Also capture class/field names if needed, but columns are primary
                entity_mappings[table_name] = {
                    "file": os.path.relpath(file_path, model_dir),
                    "columns": all_cols
                }

print(f"Loaded {len(entity_mappings)} entities mapping to unique tables.")

# Step 2: Parse Legacy migrations to construct the base schema
print("\nStep 2: Parsing legacy migrations to build the baseline schema...")
base_tables = {}
create_table_regex = re.compile(r"CREATE\s+TABLE\s+([\[\]a-zA-Z0-9_]+)\s*\((.*?)\);", re.IGNORECASE | re.DOTALL)
create_table_regex_no_semicolon = re.compile(r"CREATE\s+TABLE\s+([\[\]a-zA-Z0-9_]+)\s*\(([^)]*?)\n\)", re.IGNORECASE)

# We will read all SQL files in dbscripts (excluding v_next subfolder)
legacy_files = sorted([f for f in os.listdir(legacy_dir) if os.path.isfile(os.path.join(legacy_dir, f)) and f.endswith('.sql')])

# Simple parser to find columns created in legacy
for file in legacy_files:
    file_path = os.path.join(legacy_dir, file)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
        # Remove comments to make parsing cleaner
        content_no_comments = re.sub(r"--.*?\n", "", content)
        content_no_comments = re.sub(r"/\*.*?\*/", "", content_no_comments, flags=re.DOTALL)
        
        # Find all CREATE TABLE statements
        matches = re.finditer(r"CREATE\s+TABLE\s+([\[\]a-zA-Z0-9_]+)", content_no_comments, re.IGNORECASE)
        for match in matches:
            tname = match.group(1).replace("[", "").replace("]", "").strip().upper()
            if tname not in base_tables:
                base_tables[tname] = set()
            
            # Simple column extractor for this table block
            start_idx = match.end()
            bracket_count = 0
            block = ""
            for char in content_no_comments[start_idx:]:
                if char == '(':
                    bracket_count += 1
                elif char == ')':
                    bracket_count -= 1
                    if bracket_count == 0:
                        break
                if bracket_count >= 1:
                    block += char
            
            # Parse column names from the block
            for line in block.split(','):
                line = line.strip()
                if not line or line.upper().startswith(("CONSTRAINT", "PRIMARY", "FOREIGN", "UNIQUE", "INDEX", "KEY")):
                    continue
                col_match = re.match(r"^([\[\]a-zA-Z0-9_]+)", line)
                if col_match:
                    col_name = col_match.group(1).replace("[", "").replace("]", "").strip().upper()
                    base_tables[tname].add(col_name)

print(f"Parsed {len(base_tables)} tables from legacy migrations.")

# Step 3: Parse New migrations to apply renames & alterations
print("\nStep 3: Parsing new migrations to apply schema transformations...")
transformed_tables = {t: set(cols) for t, cols in base_tables.items()}

# Load all new migration scripts
new_sql_contents = []
for root, dirs, files in os.walk(migration_dir):
    for file in sorted(files):
        if file.endswith(".sql"):
            with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                new_sql_contents.append((file, f.read()))

# Track renaming procedures and executions
# e.g., sp_rename 'old_table', 'new_table'
# or sp_rename 'table.old_col', 'new_col', 'COLUMN'
# or sp_RenameColumnCS 'table', 'old_col', 'new_col'
rename_table_pattern = re.compile(r"sp_rename\s+'([^']+)'\s*,\s*'([^']+)'", re.IGNORECASE)
rename_col_pattern = re.compile(r"sp_rename\s+'([^']+)\.([^']+)'\s*,\s*'([^']+)'\s*,\s*'COLUMN'", re.IGNORECASE)
rename_cs_pattern = re.compile(r"sp_RenameColumnCS\s+'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'", re.IGNORECASE)
alter_add_pattern = re.compile(r"ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+ADD\s+([a-zA-Z0-9_]+)", re.IGNORECASE)
alter_drop_pattern = re.compile(r"ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+DROP\s+COLUMN\s+([a-zA-Z0-9_]+)", re.IGNORECASE)

for fname, sql in new_sql_contents:
    # 1. Apply Table Renames
    for match in rename_table_pattern.findall(sql):
        old_t, new_t = match[0].upper(), match[1].upper()
        if old_t in transformed_tables:
            transformed_tables[new_t] = transformed_tables.pop(old_t)
            
    # 2. Apply Column Renames via standard sp_rename
    for match in rename_col_pattern.findall(sql):
        tname, old_col, new_col = match[0].upper(), match[1].upper(), match[2].upper()
        if tname in transformed_tables and old_col in transformed_tables[tname]:
            transformed_tables[tname].remove(old_col)
            transformed_tables[tname].add(new_col)
            
    # 3. Apply Column Renames via custom sp_RenameColumnCS
    for match in rename_cs_pattern.findall(sql):
        tname, old_col, new_col = match[0].upper(), match[1].upper(), match[2].upper()
        if tname in transformed_tables and old_col in transformed_tables[tname]:
            transformed_tables[tname].remove(old_col)
            transformed_tables[tname].add(new_col)
            
    # 4. Apply Column Additions
    for match in alter_add_pattern.findall(sql):
        tname, colname = match[0].upper(), match[1].upper()
        if tname in transformed_tables:
            transformed_tables[tname].add(colname)
            
    # 5. Apply Column Drops
    for match in alter_drop_pattern.findall(sql):
        tname, colname = match[0].upper(), match[1].upper()
        if tname in transformed_tables and colname in transformed_tables[tname]:
            transformed_tables[tname].remove(colname)

print("Schema transformations applied.")

# Step 4: Compare JPA Entity Mappings with transformed schema
print("\nStep 4: Comparing JPA Entities with transformed schema...")
mismatches = 0

for table_name, data in sorted(entity_mappings.items()):
    entity_file = data["file"]
    entity_cols = data["columns"]
    
    if table_name not in transformed_tables:
        print(f"⚠️  MISSING TABLE: Entity maps to table '{table_name}' ({entity_file}), but table is not defined in migrations.")
        mismatches += 1
        continue
        
    db_cols = transformed_tables[table_name]
    
    # Check for missing columns in DB
    missing_cols = entity_cols - db_cols
    # Exclude standard fields if entities inherit from a @MappedSuperclass that might not be mapped in every single legacy migration
    # but let's see what is missing first.
    if missing_cols:
        print(f"❌ COLUMN MISMATCH in Table '{table_name}' (Entity: {entity_file}):")
        print(f"   Entity expects columns: {sorted(list(missing_cols))}")
        print(f"   DB schema has columns: {sorted(list(db_cols))}")
        mismatches += 1

if mismatches == 0:
    print("\n✅ SUCCESS: All audited JPA entity tables and columns match the final migration schema perfectly!")
else:
    print(f"\n⚠️  Completed with {mismatches} mismatch warnings. Please review the details above.")
