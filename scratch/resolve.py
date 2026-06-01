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

def resolve_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if '<<<<<<< HEAD' not in content:
        return
        
    lines = content.split('\n')
    out_lines = []
    
    in_conflict = False
    head_lines = []
    main_lines = []
    current_chunk = None
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            head_lines = []
            main_lines = []
            current_chunk = 'HEAD'
            continue
            
        if line.startswith('======='):
            current_chunk = 'MAIN'
            continue
            
        if line.startswith('>>>>>>> main'):
            in_conflict = False
            
            # Resolve logic
            head_text = '\n'.join(head_lines)
            main_text = '\n'.join(main_lines)
            
            if "BOSFormDialog.jsx" in filepath:
                out_lines.append(main_text)
            elif "TaskDashboard/index" in filepath:
                # keep head logic which has todayStr
                out_lines.append(head_text)
            elif "MasterCheckList.jsx" in filepath:
                # HEAD has complex updatedUser logic, let's just use HEAD for this part, but update formatDateTime if needed
                out_lines.append(head_text)
            elif "axios.js" in filepath:
                combined = """    const isMockRoute = error.config?.url && (
      error.config.url.includes('/api/posts/') ||
      error.config.url.includes('/api/friends/') ||
      error.config.url.includes('/api/followers/') ||
      error.config.url.includes('/api/friend-request/') ||
      error.config.url.includes('/api/gallery/') ||
      error.config.url.includes('/api/details-card/') ||
      error.config.url.includes('/api/simple-card/') ||
      error.config.url.includes('/api/profile-card/') ||
      error.config.url.includes('/api/user-list/')
    );

    const isAuthEndpoint = error.config?.url && (
      error.config.url.includes('/check-credentials') ||
      error.config.url.includes('/account/login') ||
      error.config.url.includes('/account/face-login')
    );
    const isExpectedAuthError = isAuthEndpoint && [400, 403, 405].includes(error.response?.status);

    const skipGlobalAlert = error.config?.skipGlobalAlert;

    if (error.response?.status !== 401 && !isExpectedAuthError && !skipGlobalAlert && !isMockRoute) {
      if (window.showAlert) {
        window.showAlert(`Server / Database Error:\\n${errMsg}`);
      } else {
        alert(`Server / Database Error:\\n${errMsg}`);
      }"""
                out_lines.append(combined)
            else:
                # default to main
                out_lines.append(main_text)
                
            current_chunk = None
            continue
            
        if in_conflict:
            if current_chunk == 'HEAD':
                head_lines.append(line)
            else:
                main_lines.append(line)
        else:
            out_lines.append(line)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))

for f in files:
    resolve_file(f)
