import subprocess
import os

commits = [
    {
        "files": ["autonoma-backend/src/main/java/com/autonoma/erp/controller/DepartmentController.java"],
        "msg": "refactor(backend): update DepartmentController mappings"
    },
    {
        "files": ["autonoma-frontend/employeemaster.xhtml", "docs/employeemaster.xhtml"],
        "msg": "chore(cleanup): remove legacy employeemaster xhtml views"
    },
    {
        "files": ["autonoma-frontend/src/layout/MainLayout/Footer.jsx"],
        "msg": "style(layout): refine MainLayout Footer component layout"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/bos/BOSStyles.js"],
        "msg": "style(bos): update BOS styles with centralized styling tokens"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/bos/BOSDataTable.jsx"],
        "msg": "feat(bos): enhance BOSDataTable styling and pagination defaults"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/bos/BOSExportButton.jsx"],
        "msg": "feat(bos): update BOSExportButton with custom styles"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/bos/BOSFormDialog.jsx"],
        "msg": "feat(bos): add window controls (minimize/maximize) and border resizers to BOSFormDialog"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/bos/BOSMovableDialog.jsx"],
        "msg": "feat(bos): introduce BOSMovableDialog with viewport drag-and-resize support"
    },
    {
        "files": ["autonoma-frontend/src/ui-component/cards/MainCard.jsx"],
        "msg": "style(ui): update MainCard styling presets"
    },
    {
        "files": [
            "autonoma-frontend/src/views/admin/AuditTrailPage.jsx",
            "autonoma-frontend/src/views/admin/BusinessAuthorization.jsx"
        ],
        "msg": "feat(admin): standardize AuditTrail and BusinessAuth views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/admin/CompanyProfile.jsx",
            "autonoma-frontend/src/views/admin/DivisionMaster.jsx"
        ],
        "msg": "feat(admin): update CompanyProfile and DivisionMaster with BOS standards"
    },
    {
        "files": [
            "autonoma-frontend/src/views/admin/FileTraceabilityHub.jsx",
            "autonoma-frontend/src/views/admin/PreferenceMaster.jsx"
        ],
        "msg": "feat(admin): standardize FileTraceability and Preference views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/admin/PrefixCredentials.jsx",
            "autonoma-frontend/src/views/admin/SessionMonitoring.jsx"
        ],
        "msg": "feat(admin): standardize PrefixCredentials and SessionMonitoring"
    },
    {
        "files": [
            "autonoma-frontend/src/views/admin/UserAccess.jsx",
            "autonoma-frontend/src/views/admin/UserOverview.jsx",
            "autonoma-frontend/src/views/admin/UserSessionAnalytics.jsx"
        ],
        "msg": "feat(admin): update user management views with BOS standards"
    },
    {
        "files": [
            "autonoma-frontend/src/views/master/hr/AddDepartmentDialog.jsx",
            "autonoma-frontend/src/views/master/hr/AddDesignationDialog.jsx"
        ],
        "msg": "feat(hr): update department and designation add dialogs"
    },
    {
        "files": [
            "autonoma-frontend/src/views/master/hr/DepartmentDetails.jsx",
            "autonoma-frontend/src/views/master/hr/DesignationMaster.jsx"
        ],
        "msg": "feat(hr): standardize DepartmentDetails and DesignationMaster views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/master/hr/EmployeeList.jsx",
            "autonoma-frontend/src/views/master/hr/EmployeeMaster.jsx",
            "autonoma-frontend/src/views/master/hr/EmployeeSubSections.jsx"
        ],
        "msg": "feat(hr): update Employee list, master, and subsection views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/master/hr/ats/InductionAssignment.jsx",
            "autonoma-frontend/src/views/master/hr/ats/InductionCriteria.jsx"
        ],
        "msg": "feat(ats): update induction assignment and criteria views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/master/hr/ats/InductionTrainee.jsx",
            "autonoma-frontend/src/views/master/hr/ats/InductionTraining.jsx"
        ],
        "msg": "feat(ats): standardize induction trainee and training views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/qms/AuditAttendance/AuditAttendance.jsx",
            "autonoma-frontend/src/views/qms/checklist/CheckListRenewalVerify.jsx",
            "autonoma-frontend/src/views/qms/checklist/CheckListVerify.jsx",
            "autonoma-frontend/src/views/qms/checklist/CloseCheckListRenewal.jsx"
        ],
        "msg": "feat(qms): update audit attendance and checklist verification views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/qms/AuditObservation/AddAuditObservation.jsx",
            "autonoma-frontend/src/views/qms/AuditObservation/AuditObservationList.jsx",
            "autonoma-frontend/src/views/qms/AuditSchedule/AddAuditSchedule.jsx"
        ],
        "msg": "feat(qms): standardize audit observation and scheduling views"
    },
    {
        "files": [
            "autonoma-frontend/src/views/qms/MeetingMinutes/AddMeetingMinutes.jsx",
            "autonoma-frontend/src/views/qms/MeetingMinutes/MomList.jsx"
        ],
        "msg": "feat(qms): update meeting minutes (MOM) and lists"
    },
    {
        "files": [
            "autonoma-frontend/src/views/sm/CustomerMaster.jsx",
            "autonoma-frontend/src/views/sm/SupplierMaster.jsx"
        ],
        "msg": "feat(sm): update customer and supplier master views with BOS standards"
    },
    {
        "files": [
            "autonoma-frontend/src/views/sm/masters/CountryMaster.jsx",
            "autonoma-frontend/src/views/sm/masters/DeliveryTerms.jsx",
            "autonoma-frontend/src/views/sm/masters/PaymentTerms.jsx",
            "autonoma-frontend/src/views/sm/masters/StateMaster.jsx",
            "autonoma-frontend/src/views/sm/masters/TypeOfService.jsx"
        ],
        "msg": "feat(sm): standardize sales and marketing country, state, terms, and service masters"
    }
]

cwd = "/Users/eash/Desktop/ERP 1.11.56 AM"

def run_cmd(args):
    print(f"Running: {' '.join(args)}")
    res = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error executing command: {res.stderr}")
        return False
    return True

# Reset staging first just in case
run_cmd(["git", "reset"])

# Commit loop
count = 0
for idx, commit in enumerate(commits):
    print(f"\n--- Commit {idx + 1}/{len(commits)} ---")
    # Add files
    for file in commit["files"]:
        if os.path.exists(os.path.join(cwd, file)) or run_cmd(["git", "ls-files", "--error-unmatch", file]):
            if not run_cmd(["git", "add", file]):
                print(f"Failed to add file: {file}")
        else:
            print(f"File does not exist: {file}")
    
    # Commit
    if run_cmd(["git", "commit", "-m", commit["msg"]]):
        count += 1
    else:
        print(f"Failed to commit message: {commit['msg']}")

print(f"\nSuccessfully committed {count} packages out of {len(commits)}")

# Push to origin main
run_cmd(["git", "push", "origin", "main"])
