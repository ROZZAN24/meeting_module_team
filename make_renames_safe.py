import os
import re

def make_renames_safe(directory):
    print(f"Scanning directory: {directory}")
    pattern = re.compile(r"EXEC\s+sp_rename\s+'([^']+)'\s*,\s*'([^']+)'\s*;?", re.IGNORECASE)
    
    for filename in os.listdir(directory):
        if not filename.endswith('.sql'):
            continue
        
        file_path = os.path.join(directory, filename)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        modified = False
        
        # We want to find sp_rename calls that don't specify 'COLUMN' (which would be column renames)
        matches = list(pattern.finditer(content))
        # Process matches in reverse order so character offsets remain valid
        for match in reversed(matches):
            full_match = match.group(0)
            old_table = match.group(1)
            new_table = match.group(2)
            
            # Check if this is a column rename (has 'COLUMN' or '.' in old_table)
            if '.' in old_table:
                # This is a column rename, skip it
                continue
                
            # Let's inspect the context to make sure it's not a column rename
            # (sometimes the 'COLUMN' parameter might be on the next line or formatted differently,
            # but usually it's sp_rename 'table.col', 'new_col', 'COLUMN')
            # If there is no dot in the first argument, it's definitely a table rename.
            
            print(f"Found table rename in {filename}: {old_table} -> {new_table}")
            
            safe_block = f"""EXEC sp_executesql N'
IF OBJECT_ID(''{old_table}'', ''U'') IS NOT NULL
BEGIN
    IF OBJECT_ID(''{new_table}'', ''U'') IS NOT NULL
    BEGIN
        DECLARE @rows INT = 0;
        SELECT @rows = SUM(partitions.rows) 
        FROM sys.objects AS o
        INNER JOIN sys.partitions AS partitions ON o.object_id = partitions.object_id
        WHERE o.name = ''{new_table}'' AND o.type = ''U'' AND partitions.index_id IN (0, 1);
        
        IF @rows = 0
        BEGIN
            DROP TABLE {new_table};
            EXEC sp_rename ''{old_table}'', ''{new_table}'';
        END
    END
    ELSE
    BEGIN
        EXEC sp_rename ''{old_table}'', ''{new_table}'';
    END
END
';"""
            
            start, end = match.span()
            content = content[:start] + safe_block + content[end:]
            modified = True
            
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filename}")

if __name__ == '__main__':
    # Update dbscripts/v_next
    make_renames_safe(r'd:\Projects\anitigravity\intern\autonoma-backend\src\main\resources\dbscripts\v_next')
    # Update db/migration/user etc. if needed
    make_renames_safe(r'd:\Projects\anitigravity\intern\autonoma-backend\src\main\resources\db\migration\user')
