import os
import re

model_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java/com/autonoma/erp/model"

tables_map = {}

for root, dirs, files in os.walk(model_dir):
    for file in files:
        if file.endswith(".java"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                # Find @Table(name = "...") or @Table(name="...")
                match = re.search(r'@Table\(\s*name\s*=\s*"([^"]+)"', content)
                if match:
                    table_name = match.group(1)
                    tables_map[file] = {
                        "path": path,
                        "table": table_name
                    }

for file, info in sorted(tables_map.items()):
    print(f"{file} -> {info['table']} -> {info['path']}")
