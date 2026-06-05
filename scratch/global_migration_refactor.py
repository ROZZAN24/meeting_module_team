import os
import re

# 1. Regex pattern for Table Renames
# Matches:
# IF OBJECT_ID('table1', 'U') IS NOT NULL
# BEGIN
#     EXEC sp_rename 'table1', 'table2';
# END
# GO
# Supporting variable casings, whitespace, and optional brackets
table_rename_pattern = re.compile(
    r"IF\s+OBJECT_ID\('(\w+)',\s*'U'\)\s+IS\s+NOT\s+NULL\s*\n"
    r"BEGIN\s*\n"
    r"\s*(?:EXEC\s+)?sp_rename\s+'\1',\s*'(\w+)';?\s*\n"
    r"END\s*\n"
    r"GO",
    re.IGNORECASE | re.MULTILINE
)

# 2. Regex pattern for PK standardizations
# Matches the standard primary key renaming block
pk_pattern = re.compile(
    r"DECLARE\s+@(\w+_pk)\s+NVARCHAR\(256\);\s*\n"
    r"\s*SELECT\s+TOP\s+1\s+@\1\s+=\s+name\s+FROM\s+sys\.key_constraints\s+WHERE\s+parent_object_id\s+=\s+OBJECT_ID\('(\w+)'\)\s+AND\s+type\s+=\s+'PK';\s*\n"
    r"\s*IF\s+@\1\s+IS\s+NOT\s+NULL\s+AND\s+@\1\s+<>\s+'PK_\2'\s*\n"
    r"\s*BEGIN\s*\n"
    r"\s*DECLARE\s+@drop_\1\s+NVARCHAR\(MAX\)\s+=\s+'ALTER\s+TABLE\s+\2\s+DROP\s+CONSTRAINT\s+'\s*\+\s*@\1;\s*\n"
    r"\s*EXEC\(@drop_\1\);\s*\n"
    r"\s*END\s*\n"
    r"\s*IF\s+NOT\s+EXISTS\s*\(SELECT\s+1\s+FROM\s+sys\.key_constraints\s+WHERE\s+parent_object_id\s+=\s+OBJECT_ID\('\2'\)\s+AND\s+name\s+=\s+'PK_\2'\)\s*\n"
    r"\s*BEGIN\s*\n"
    r"\s*ALTER\s+TABLE\s+\2\s+ADD\s+CONSTRAINT\s+PK_\2\s+PRIMARY\s+KEY\s+\((\w+)\);\s*\n"
    r"\s*END",
    re.MULTILINE | re.IGNORECASE
)

def refactor_sql_content(content, file_name):
    modified = False

    # 1. Refactor Table Renames
    def replace_table_rename(match):
        old_table = match.group(1)
        new_table = match.group(2)
        print(f"  [{file_name}] Found table rename: {old_table} -> {new_table}")
        
        replacement = (
            f"IF OBJECT_ID('dbo.sp_RenameTableCasingAndPrefix', 'P') IS NOT NULL\n"
            f"BEGIN\n"
            f"    EXEC dbo.sp_RenameTableCasingAndPrefix '{old_table}', '{new_table}';\n"
            f"END\n"
            f"ELSE\n"
            f"BEGIN\n"
            f"    IF OBJECT_ID('{old_table}', 'U') IS NOT NULL AND OBJECT_ID('{new_table}', 'U') IS NULL\n"
            f"        EXEC sp_rename '{old_table}', '{new_table}';\n"
            f"END\n"
            f"GO"
        )
        return replacement

    new_content, table_renames_count = table_rename_pattern.subn(replace_table_rename, content)
    if table_renames_count > 0:
        content = new_content
        modified = True
        print(f"  [{file_name}] Refactored {table_renames_count} table rename(s).")

    # 2. Refactor Primary Keys
    def replace_pk_block(match):
        var_name = match.group(1)
        table_name = match.group(2)
        pk_column = match.group(3)
        print(f"  [{file_name}] Found PK block for table: {table_name} ({pk_column})")
        
        replacement = (
            f"DECLARE @{var_name} NVARCHAR(256);\n"
            f"    SELECT TOP 1 @{var_name} = name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('{table_name}') AND type = 'PK';\n"
            f"    IF @{var_name} IS NOT NULL AND @{var_name} <> 'PK_{table_name}' AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE referenced_object_id = OBJECT_ID('{table_name}'))\n"
            f"    BEGIN\n"
            f"        DECLARE @drop_{var_name} NVARCHAR(MAX) = 'ALTER TABLE {table_name} DROP CONSTRAINT ' + @{var_name};\n"
            f"        EXEC(@drop_{var_name});\n"
            f"    END\n"
            f"    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('{table_name}') AND type = 'PK')\n"
            f"    BEGIN\n"
            f"        ALTER TABLE {table_name} ADD CONSTRAINT PK_{table_name} PRIMARY KEY ({pk_column});\n"
            f"    END"
        )
        return replacement

    new_content, pk_count = pk_pattern.subn(replace_pk_block, content)
    if pk_count > 0:
        content = new_content
        modified = True
        print(f"  [{file_name}] Refactored {pk_count} primary key block(s).")

    return content, modified

def run_refactoring():
    search_dirs = [
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/db/migration/",
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/dbscripts/v_next/"
    ]
    
    total_files = 0
    modified_files = 0

    for directory in search_dirs:
        if not os.path.exists(directory):
            continue
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(".sql"):
                    file_path = os.path.join(root, file)
                    total_files += 1
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content, modified = refactor_sql_content(content, file)
                    if modified:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        modified_files += 1
                        print(f"-> Saved: {file_path}")

    print("========================================")
    print(f"Refactoring complete! Total SQL files scanned: {total_files}, Modified: {modified_files}")
    print("========================================")

if __name__ == '__main__':
    run_refactoring()
