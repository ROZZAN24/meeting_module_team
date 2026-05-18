import os

def process_file(filepath):
    print(f"Processing {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    new_lines = []
    in_head = False
    in_middle = False
    in_theirs = False
    conflict_found = False

    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_head = True
            conflict_found = True
            continue
        elif line.startswith('======='):
            if in_head:
                in_head = False
                in_middle = True
            elif in_middle:
                pass
            continue
        elif line.startswith('>>>>>>>'):
            if in_middle or in_theirs or in_head:
                in_head = False
                in_middle = False
                in_theirs = False
            continue

        if in_head:
            new_lines.append(line)
        elif in_middle:
            pass # Ignore theirs
        elif not in_head and not in_middle:
            new_lines.append(line)

    if conflict_found:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Resolved conflicts in {filepath}")

import subprocess
# Get unmerged files
status = subprocess.check_output(['git', 'status', '--porcelain']).decode('utf-8')
for line in status.split('\n'):
    if line.startswith('UU '):
        filepath = line[3:]
        process_file(filepath)
        subprocess.check_call(['git', 'add', filepath])

print("Done.")
