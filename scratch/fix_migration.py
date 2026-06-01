import re
import sys

def make_idempotent(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match:
    # IF COL_LENGTH('TABLE', 'source') IS NOT NULL
    #     EXEC sp_rename 'TABLE.source', 'target', 'COLUMN';
    # Or without BEGIN/END
    pattern = r"IF\s+COL_LENGTH\(\s*'([^'\s]+)'\s*,\s*'([^'\s]+)'\s*\)\s+IS\s+NOT\s+NULL\s*\n?\s*(?:BEGIN\s*\n?\s*)?EXEC\s+sp_rename\s*'[^']+'\s*,\s*'([^'\s]+)'\s*,\s*'COLUMN'\s*;"
    
    def replacer(match):
        table = match.group(1)
        source = match.group(2)
        target = match.group(3)
        
        # Check if the target is already checked
        original = match.group(0)
        # We want to insert the condition: AND COL_LENGTH('TABLE', 'target') IS NULL
        new_condition = f"IF COL_LENGTH('{table}', '{source}') IS NOT NULL AND COL_LENGTH('{table}', '{target}') IS NULL"
        
        # Replace the original condition with the new condition
        # We find the first line (the IF condition) and replace it
        lines = original.split('\n')
        lines[0] = new_condition
        return '\n'.join(lines)

    new_content = re.sub(pattern, replacer, content, flags=re.IGNORECASE)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Processed: {file_path}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        make_idempotent(sys.argv[1])
