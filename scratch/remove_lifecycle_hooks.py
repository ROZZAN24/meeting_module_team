import os
import re

model_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java/com/autonoma/erp/model"

target_files = [
    "AuditArea.java",
    "AuditAttendance.java",
    "AuditCriteria.java",
    "AuditObservation.java",
    "AuditSchedule.java"
]

for fname in target_files:
    path = os.path.join(model_dir, fname)
    if not os.path.exists(path):
        continue
    with open(path, "r") as f:
        content = f.read()
        
    # Remove @PrePersist/@PreUpdate and protected void onCreate/onUpdate block
    content = re.sub(r'\s*@PrePersist\s+protected\s+void\s+onCreate\(\)\s*\{[^}]*\}', '', content)
    content = re.sub(r'\s*@PreUpdate\s+protected\s+void\s+onUpdate\(\)\s*\{[^}]*\}', '', content)
    content = re.sub(r'\s*protected\s+void\s+onCreate\(\)\s*\{[^}]*\}', '', content)
    content = re.sub(r'\s*protected\s+void\s+onUpdate\(\)\s*\{[^}]*\}', '', content)
    
    with open(path, "w") as f:
        f.write(content)
    print(f"Removed lifecycle methods from {fname}")
