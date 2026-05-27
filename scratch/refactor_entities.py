import os
import re

model_dir = "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend/src/main/java/com/autonoma/erp/model"

mappings = {
    "AuditArea.java": ("QMS_AUDIT_AREA", True),
    "AuditAttendance.java": ("QMS_AUDIT_ATTENDANCE", True),
    "AuditCriteria.java": ("QMS_AUDIT_CRITERIA", True),
    "AuditObservation.java": ("QMS_AUDIT_OBSERVATION", True),
    "AuditObservationDetail.java": ("QMS_AUDIT_OBSERVATION_DETAIL", True),
    "AuditSchedule.java": ("QMS_AUDIT_SCHEDULE", True),
    "AuditScheduleCriteria.java": ("QMS_AUDIT_SCHEDULE_CRITERIA", True),
    "AuditType.java": ("QMS_AUDIT_TYPE", True),
    "InductionAssignment.java": ("IND_INDUCTION_ASSIGNMENT", True),
    "InductionMaster.java": ("IND_INDUCTION_MASTER", True),
    "InductionTrainingDetail.java": ("IND_INDUCTION_TRAINING_DETAIL", True),
    "NcrOfiAction.java": ("QMS_NCR_OFI_ACTION", True),
    "NcrOfiApproval.java": ("QMS_NCR_OFI_APPROVAL", True),
    "NcrOfiAttachment.java": ("QMS_NCR_OFI_ATTACHMENT", True),
    "NcrOfiMaster.java": ("QMS_NCR_OFI_MASTER", True),
    "ChecklistAssignment.java": ("QMS_CHECKLIST_ASSIGNMENT", True),
    "ChecklistDepartment.java": ("QMS_CHECKLIST_DEPARTMENT", False),
    "ChecklistVerification.java": ("QMS_CHECKLIST_VERIFICATION", True),
    "MasterChecklist.java": ("QMS_CHECKLIST_MASTER", True),
    "QmsMeetingMaster.java": ("QMS_MEETING_MASTER", True),
    "QmsMeetingSchedule.java": ("QMS_MEETING_SCHEDULE", True),
    "QmsMeetingScheduleDepartment.java": ("QMS_MEETING_SCHEDULE_DEPARTMENT", False),
    "QmsMeetingScheduleParticipant.java": ("QMS_MEETING_SCHEDULE_PARTICIPANT", False),
    "QmsMeetingUserAttendance.java": ("QMS_MEETING_USER_ATTENDANCE", True),
    "QmsModelName.java": ("QMS_MODEL_NAME", True),
    "QmsMomAttendance.java": ("QMS_MOM_ATTENDANCE", True),
    "QmsMomDetail.java": ("QMS_MOM_DETAIL", True),
    "QmsMomMaster.java": ("QMS_MOM_MASTER", True),
    "QmsUom.java": ("QMS_UOM", True)
}

fields_to_remove = [
    "createdBy", "createdDate", "createdAt", "updatedBy", "updatedDate", "updatedAt"
]

def refactor_file(file_name, new_table, is_audited):
    path = os.path.join(model_dir, file_name)
    if not os.path.exists(path):
        print(f"File not found: {file_name}")
        return
        
    with open(path, "r") as f:
        content = f.read()

    # 1. Update @Table
    content = re.sub(r'@Table\s*\(\s*name\s*=\s*\"[^\"]+\"\s*\)', f'@Table(name = "{new_table}")', content)

    if is_audited:
        # 2. Add extends BaseAuditEntity
        if "extends" not in content:
            content = re.sub(r'public class (\w+)\s*\{', r'public class \1 extends BaseAuditEntity {', content)
            content = re.sub(r'public class (\w+)\s*implements', r'public class \1 extends BaseAuditEntity implements', content)
        
        # 3. Remove local audit fields and their getters/setters/lifecycle hooks
        lines = content.split("\n")
        new_lines = []
        skip_mode = False
        skip_braces = 0
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Detect field annotation or field itself
            field_match = re.search(r'private\s+(String|Date|LocalDateTime)\s+(createdBy|createdDate|createdAt|updatedBy|updatedDate|updatedAt)\b', line)
            
            # Detect getter or setter
            accessor_match = re.search(r'public\s+(String|Date|LocalDateTime|void)\s+(get|set)(CreatedBy|CreatedDate|CreatedAt|UpdatedBy|UpdatedDate|UpdatedAt)\b', line)
            
            # Detect PrePersist / PreUpdate
            lifecycle_match = re.search(r'@Pre(Persist|Update)\b', line)
            
            if field_match or accessor_match or lifecycle_match:
                # Start skipping lines for the field/method block
                skip_mode = True
                skip_braces = 0
                
                # If it's a field definition, check if it's annotated on previous lines (like @Column, @Temporal)
                # and remove them from new_lines
                while new_lines and new_lines[-1].strip().startswith("@"):
                    new_lines.pop()
                
                # Check if this line itself has a body
                if "{" in line:
                    skip_braces += line.count("{") - line.count("}")
                else:
                    # Single line field definition without brackets
                    # but check if next line has opening bracket (for method declarations)
                    if i + 1 < len(lines) and "{" in lines[i+1] and "(" in line:
                        pass
                    else:
                        skip_mode = False # Single line field, just discard this line
                
                i += 1
                continue
                
            if skip_mode:
                skip_braces += line.count("{") - line.count("}")
                if skip_braces <= 0:
                    skip_mode = False
                i += 1
                continue
                
            new_lines.append(line)
            i += 1
            
        content = "\n".join(new_lines)
        
    with open(path, "w") as f:
        f.write(content)
    print(f"Successfully refactored {file_name}")

for fname, (tbl, audited) in mappings.items():
    refactor_file(fname, tbl, audited)
