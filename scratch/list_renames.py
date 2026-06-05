import re

def list_renames(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's find all IF OBJECT_ID('...', 'U') IS NOT NULL blocks followed by sp_rename '...', '...'
    pattern = re.compile(
        r"IF OBJECT_ID\('(\w+)', 'U'\) IS NOT NULL\s*\n"
        r"BEGIN\s*\n"
        r"\s*EXEC sp_rename '(\w+)', '(\w+)';\s*\n"
        r"END\s*\n"
        r"GO",
        re.IGNORECASE
    )
    
    matches = pattern.findall(content)
    print(f"Found {len(matches)} simple table renames in {file_path}:")
    for idx, (check_tbl, old_tbl, new_tbl) in enumerate(matches, 1):
        print(f"  {idx}. Check: {check_tbl}, Old: {old_tbl}, New: {new_tbl}")

if __name__ == '__main__':
    list_renames("/Users/darshankrishnakumar/Downloads/Autonoma_ERP-main/autonoma-backend/src/main/resources/db/migration/employee/V004__Employee_Module.sql")
