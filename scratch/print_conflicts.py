import os

files = [
    "autonoma-backend/db_checklist_dump.txt",
    "autonoma-backend/src/main/resources/db/migration/hr_master/V003__HR_Master_Module.sql",
    "autonoma-backend/src/main/resources/db/migration/master/V001__Master_Module.sql",
    "autonoma-backend/src/main/resources/db/migration/user/V002__User_Module.sql",
    "autonoma-backend/src/main/resources/dbscripts/20260530_V59.0__Add_Task_Verifier_To_Employee_Master.sql",
    "autonoma-backend/src/main/resources/dbscripts/v_next/V001__Master_Module.sql",
    "autonoma-backend/src/main/resources/dbscripts/v_next/V002__User_Module.sql",
    "autonoma-backend/src/main/resources/dbscripts/v_next/V003__HR_Master_Module.sql",
    "autonoma-frontend/src/ui-component/bos/BOSFormDialog.jsx",
    "autonoma-frontend/src/utils/axios.js",
    "autonoma-frontend/src/views/dashboard/TaskDashboard/index.jsx",
    "autonoma-frontend/src/views/qms/checklist/MasterCheckList.jsx"
]

def print_conflicts(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        return

    in_conflict = False
    conflict_lines = []
    
    for i, line in enumerate(lines):
        if line.startswith("<<<<<<< HEAD"):
            in_conflict = True
            print(f"\n--- CONFLICT IN {filepath} (Line {i+1}) ---")
        
        if in_conflict:
            print(line.rstrip())
            
        if line.startswith(">>>>>>> main"):
            in_conflict = False
            print("------------------------------------------\n")

for f in files:
    if os.path.exists(f):
        print_conflicts(f)
