import os
import re

def process_file(filepath):
    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    ours_lines = []
    theirs_lines = []
    
    in_conflict = False
    in_theirs = False
    ours_block = []
    theirs_block = []
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            in_theirs = False
            ours_block = []
            theirs_block = []
        elif line.startswith('======='):
            if in_conflict:
                in_theirs = True
            else:
                ours_lines.append(line)
                theirs_lines.append(line)
        elif line.startswith('>>>>>>> origin/main'):
            if in_conflict:
                in_conflict = False
                ours_lines.extend(ours_block)
                theirs_lines.extend(theirs_block)
            else:
                ours_lines.append(line)
                theirs_lines.append(line)
        else:
            if in_conflict:
                if in_theirs:
                    theirs_block.append(line)
                else:
                    ours_block.append(line)
            else:
                ours_lines.append(line)
                theirs_lines.append(line)
                
    ours_resolved = "".join(ours_lines)
    theirs_resolved = "".join(theirs_lines)
    
    # Save the clean local version (ours) back to the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(ours_resolved)
    
    # Save the remote version (theirs) next to it for reference if they are different
    if ours_resolved != theirs_resolved:
        remote_path = filepath + ".remote"
        with open(remote_path, 'w', encoding='utf-8') as f:
            f.write(theirs_resolved)
        print(f"  Created remote reference: {remote_path}")
    else:
        print("  Ours and theirs are identical.")

def find_conflicted_files(root_dir):
    conflicted = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Prune node_modules, .git, and build targets in-place to avoid recursing
        dirnames[:] = [d for d in dirnames if d not in ('.git', 'node_modules', 'target', 'build')]
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    if '<<<<<<< HEAD' in f.read():
                        conflicted.append(filepath)
            except Exception:
                pass
    return conflicted

if __name__ == "__main__":
    root = r"c:\Users\bpras\Desktop\Autonoma_ERP-main\Autonoma_ERP-main"
    files = find_conflicted_files(root)
    print(f"Found {len(files)} conflicted files.")
    for f in files:
        process_file(f)
