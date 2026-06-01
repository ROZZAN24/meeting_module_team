import os
import re

def fix_broken_ifs(directory):
    print(f"Scanning directory: {directory}")
    # Regex to match: IF COL_LENGTH('TABLE_NAME', 'source_col') IS NOT NULL AND COL_LENGTH('TABLE_NAME', 'TARGET_COL') IS NULL
    pattern = re.compile(
        r"^(\s*)IF\s+COL_LENGTH\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s+IS\s+NOT\s+NULL\s+AND\s+COL_LENGTH\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s+IS\s+NULL\s*$",
        re.IGNORECASE
    )
    
    for filename in os.listdir(directory):
        if not filename.endswith('.sql'):
            continue
        
        file_path = os.path.join(directory, filename)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        modified = False
        lines = content.splitlines()
        num_lines = len(lines)
        
        for i in range(num_lines):
            line = lines[i]
            match = pattern.match(line)
            if match:
                # Find the next non-empty non-comment line to see if it is a statement or another check/end
                next_non_empty = ""
                for j in range(i + 1, num_lines):
                    stripped_next = lines[j].strip()
                    if stripped_next and not stripped_next.startswith("--"):
                        next_non_empty = stripped_next
                        break
                
                # If the next statement is another IF check, END, or GO, then this check is empty!
                is_empty = (
                    next_non_empty.upper().startswith("IF ") or 
                    next_non_empty.upper().startswith("END") or
                    next_non_empty.upper().startswith("GO") or
                    next_non_empty == ""
                )
                
                if is_empty:
                    indent = match.group(1)
                    tbl1 = match.group(2)
                    col1 = match.group(3)
                    tbl2 = match.group(4)
                    col2 = match.group(5)
                    
                    # Reconstruct the correct line with the EXEC sp_rename body
                    corrected_line = f"{indent}IF COL_LENGTH('{tbl1}', '{col1}') IS NOT NULL AND COL_LENGTH('{tbl2}', '{col2}') IS NULL EXEC sp_rename '{tbl1}.{col1}', '{col2}', 'COLUMN';"
                    lines[i] = corrected_line
                    modified = True
                    print(f"Fixed empty check at line {i+1} in {filename}: {tbl1}.{col1} -> {col2}")
                else:
                    # It has a body (e.g. BEGIN or EXEC), skip it!
                    pass
                
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines) + '\n')
            print(f"Saved {filename}")

if __name__ == '__main__':
    fix_broken_ifs(r'd:\Projects\anitigravity\intern\autonoma-backend\src\main\resources\dbscripts\v_next')
    fix_broken_ifs(r'd:\Projects\anitigravity\intern\autonoma-backend\src\main\resources\db\migration\user')
