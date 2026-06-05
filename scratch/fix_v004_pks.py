import re

def fix_sql_file(file_path):
    print(f"Processing: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic regex pattern to match any of the PK standardization blocks
    # Captures:
    # 1: Variable name (e.g. emp_pk)
    # 2: Table name (e.g. HR_EMPLOYEE)
    # 3: Primary key column (e.g. id)
    pattern = re.compile(
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
        re.MULTILINE
    )

    def replace_pk_block(match):
        var_name = match.group(1)
        table_name = match.group(2)
        pk_column = match.group(3)
        
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
        print(f"  Fixed PK standardization for: {table_name} ({pk_column})")
        return replacement

    new_content, count = pattern.subn(replace_pk_block, content)
    print(f"  Total blocks modified: {count}")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == '__main__':
    files = [
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/db/migration/employee/V004__Employee_Module.sql",
        "/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/dbscripts/v_next/V004__Employee_Module.sql"
    ]
    for f in files:
        fix_sql_file(f)
