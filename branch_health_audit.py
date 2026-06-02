#!/usr/bin/env python3
import os
import re
import subprocess
import sys
import json
from datetime import datetime

# Configurations
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(WORKSPACE_DIR, "autonoma-backend")
FRONTEND_DIR = os.path.join(WORKSPACE_DIR, "autonoma-frontend")
DBSCRIPTS_DIR = os.path.join(BACKEND_DIR, "src/main/resources/dbscripts")
MODEL_DIR = os.path.join(BACKEND_DIR, "src/main/java/com/autonoma/erp/model")
FRONTEND_VIEWS_DIR = os.path.join(FRONTEND_DIR, "src/views")

def run_git_command(args, cwd=WORKSPACE_DIR):
    try:
        res = subprocess.run(["git"] + args, capture_output=True, text=True, cwd=cwd, check=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        return None

def get_active_branches():
    # Retrieve remote-tracking branches from origin
    stdout = run_git_command(["branch", "-r", "--list", "origin/*"])
    if not stdout:
        return []
    
    branches = []
    for line in stdout.split("\n"):
        line = line.strip()
        if "->" in line:
            continue
        branch_name = line.replace("origin/", "")
        if branch_name != "main":
            branches.append(branch_name)
    return sorted(list(set(branches)))

def audit_git_branches():
    print("🔍 Auditing Developer Branches...")
    branches = get_active_branches()
    report = []
    
    # Run fetch to ensure local knowledge of remote branches is fresh
    run_git_command(["fetch", "--all"])
    
    for branch in branches:
        remote_ref = f"origin/{branch}"
        
        # Calculate ahead/behind count relative to origin/main
        ahead = run_git_command(["rev-list", "--count", f"origin/main..{remote_ref}"])
        behind = run_git_command(["rev-list", "--count", f"{remote_ref}..origin/main"])
        
        ahead = int(ahead) if ahead is not None else 0
        behind = int(behind) if behind is not None else 0
        
        # Get last committer and date
        log_info = run_git_command(["log", "-1", "--format=%cn|%ci|%s", remote_ref])
        committer, commit_date, subject = "Unknown", "Unknown", "No commit found"
        if log_info:
            parts = log_info.split("|")
            if len(parts) >= 3:
                committer, commit_date, subject = parts[0], parts[1], "|".join(parts[2:])
        
        # Dry-run merge check to detect conflicts
        merge_base = run_git_command(["merge-base", "origin/main", remote_ref])
        has_conflict = False
        conflicting_files = []
        
        if merge_base:
            # We can use git merge-tree to check for conflicts programmatically without affecting workspace
            merge_tree = run_git_command(["merge-tree", merge_base, "origin/main", remote_ref])
            if merge_tree:
                # Search for conflict markers or indicators in merge-tree output
                if "changed in both" in merge_tree or "conflict" in merge_tree.lower():
                    has_conflict = True
                    # Find lines specifying files changed in both or conflict paths
                    for line in merge_tree.split("\n"):
                        if "changed in both" in line or "conflict" in line.lower():
                            conflicting_files.append(line.strip())
        
        report.append({
            "branch": branch,
            "ahead": ahead,
            "behind": behind,
            "committer": committer,
            "date": commit_date,
            "subject": subject,
            "has_conflict": has_conflict,
            "conflicting_files": conflicting_files[:5] # Limit list
        })
    return report

def audit_jpa_entities():
    print("🔍 Auditing JPA Entities...")
    violations = []
    
    if not os.path.exists(MODEL_DIR):
        print("⚠️  Model directory not found.")
        return violations
        
    for root, _, files in os.walk(MODEL_DIR):
        for file in files:
            if not file.endswith(".java") or file == "BaseAuditEntity.java":
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            relative_path = os.path.relpath(filepath, WORKSPACE_DIR)
            
            # Check BaseAuditEntity extension
            is_junction = "junction" in file.lower() or "mapping" in file.lower() or "attendance" in file.lower()
            extends_base = "extends BaseAuditEntity" in content
            
            if not extends_base and not is_junction:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "Inheritance",
                    "message": "Class does not extend BaseAuditEntity (standard for tracking audit fields)."
                })
            
            # Check Table name casing
            table_match = re.search(r'@Table\(\s*name\s*=\s*"([^"]+)"', content)
            if table_match:
                tbl_name = table_match.group(1)
                if tbl_name != tbl_name.upper():
                    violations.append({
                        "file": file,
                        "path": relative_path,
                        "type": "Naming Convention",
                        "message": f"Table name '{tbl_name}' is not in UPPERCASE."
                    })
            
            # Check Column names casing
            columns = re.findall(r'@Column\(\s*name\s*=\s*"([^"]+)"', content)
            for col_name in columns:
                if col_name != col_name.upper():
                    violations.append({
                        "file": file,
                        "path": relative_path,
                        "type": "Naming Convention",
                        "message": f"Column name '{col_name}' is not in UPPERCASE."
                    })
                    
            # Check for raw types or other standard violations
            if "private int " in content or "private long " in content:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "Data Types",
                    "message": "Found primitive 'int' or 'long'. Use wrapper 'Integer' or 'Long' to allow nulls."
                })
    return violations

def audit_database_migrations():
    print("🔍 Auditing DB Migration Scripts...")
    violations = []
    
    if not os.path.exists(DBSCRIPTS_DIR):
        print("⚠️  Migration scripts directory not found.")
        return violations
        
    script_versions = {}
    
    # Audit files directly in dbscripts and dbscripts/v_next
    search_dirs = [DBSCRIPTS_DIR, os.path.join(DBSCRIPTS_DIR, "v_next")]
    
    for sdir in search_dirs:
        if not os.path.exists(sdir):
            continue
            
        for file in os.listdir(sdir):
            if not file.endswith(".sql"):
                continue
                
            filepath = os.path.join(sdir, file)
            relative_path = os.path.relpath(filepath, WORKSPACE_DIR)
            
            # Check naming pattern YYYYMMDD_V[Version]__[Description]__TIS.sql
            is_tis_pattern = re.match(r"^\d{8}_V\d+(\.\d+)?(_\d+)?__.*__TIS\.sql$", file)
            is_modular_pattern = re.match(r"^V\d+__.*\.sql$", file)
            
            # Subdirectory v_next uses modular naming, parent dir uses date-prefixed naming
            in_v_next = "v_next" in sdir
            
            if not in_v_next and not is_tis_pattern and not is_modular_pattern:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "Migration Naming",
                    "message": "Script name does not follow the standard naming format: YYYYMMDD_V[Version]__[Description]__TIS.sql"
                })
                
            # Extract version token for collision detection
            version_match = re.search(r'_V(\d+(\.\d+)?(_\d+)?)__', file) or re.search(r'^V(\d+(\.\d+)?(_\d+)?)__', file)
            if version_match:
                version = version_match.group(1)
                if version in script_versions:
                    script_versions[version].append(relative_path)
                else:
                    script_versions[version] = [relative_path]
            
            # Check script contents for CREATE TABLE without audit columns
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            # Basic check for CREATE TABLE batches
            create_tables = re.findall(r"CREATE\s+TABLE\s+([A-Za-z0-9_\[\]]+)", content, re.IGNORECASE)
            for tbl in create_tables:
                tbl_clean = tbl.replace("[", "").replace("]", "").upper()
                
                # Exclude junction/mapping tables from strict audit column enforcement
                if "MAPPING" in tbl_clean or "ATTENDANCE" in tbl_clean or "ASSOCIATION" in tbl_clean:
                    continue
                    
                # Look for audit columns
                has_created_user = "CREATED_USER" in content.upper() or "CREATED_BY" in content.upper()
                has_created_date = "CREATED_DATE" in content.upper()
                has_updated_user = "UPDATED_USER" in content.upper() or "UPDATED_BY" in content.upper()
                has_updated_date = "UPDATED_DATE" in content.upper()
                
                if not (has_created_user and has_created_date and has_updated_user and has_updated_date):
                    violations.append({
                        "file": file,
                        "path": relative_path,
                        "type": "Migration Standards",
                        "message": f"Table '{tbl_clean}' is created without standard audit columns (CREATED_USER, CREATED_DATE, UPDATED_USER, UPDATED_DATE)."
                    })
                    
            # Check for use of deprecated raw TEXT type
            if re.search(r"\bTEXT\b", content, re.IGNORECASE) and not "CLOB" in content.upper():
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "Migration Data Type",
                    "message": "Script uses deprecated 'TEXT' data type. Use 'NVARCHAR(MAX)' or size-limited 'NVARCHAR(1000)'."
                })
                
    # Add version collision violations
    for ver, paths in script_versions.items():
        if len(paths) > 1:
            violations.append({
                "file": "Multiple Files",
                "path": ", ".join(paths),
                "type": "Version Collision",
                "message": f"Duplicate migration version prefix 'V{ver}' found across multiple files."
            })
            
    return violations

def audit_frontend_bos_standards():
    print("🔍 Auditing Frontend UI Components (BOS Standards)...")
    violations = []
    
    if not os.path.exists(FRONTEND_VIEWS_DIR):
        print("⚠️  Frontend views directory not found.")
        return violations
        
    for root, _, files in os.walk(FRONTEND_VIEWS_DIR):
        for file in files:
            if not file.endswith(".jsx") and not file.endswith(".js"):
                continue
                
            filepath = os.path.join(root, file)
            relative_path = os.path.relpath(filepath, WORKSPACE_DIR)
            
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            # Check for raw HTML table usage
            if "<table" in content.lower() and "BOSDataTable" not in content:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "UI Standard",
                    "message": "Raw HTML <table> or custom Table element used instead of standard BOSDataTable."
                })
                
            # Check for direct Dialog usage without BOSFormDialog
            if "<Dialog " in content and "BOSFormDialog" not in content and "DialogContent" in content:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "UI Standard",
                    "message": "Raw Material UI <Dialog> used directly. Replace with BOSFormDialog for form error shake animations."
                })
                
            # Check for window.alert instead of modern snackbars/alerts
            if "alert(" in content and "BOS" not in file:
                violations.append({
                    "file": file,
                    "path": relative_path,
                    "type": "UI Alert",
                    "message": "Native browser alert() used. Use dispatch(openSnackbar(...)) for standard UI messages."
                })
    return violations

def generate_report():
    print("====================================================")
    print("     AUTONOMA ERP TEAM DEVELOPMENT AUDIT REPORT     ")
    print("====================================================\n")
    
    branch_report = audit_git_branches()
    jpa_violations = audit_jpa_entities()
    db_violations = audit_database_migrations()
    fe_violations = audit_frontend_bos_standards()
    
    # Build Markdown Content
    md_lines = []
    md_lines.append("# Autonoma ERP Development & Team Audit Report")
    md_lines.append(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Target: TIS Modules & Developer Branches\n")
    
    md_lines.append("## 1. Branch Health & Integration Status")
    md_lines.append("This section shows status for all active developer branches relative to the main branch.")
    md_lines.append("| Branch | Commits Ahead | Commits Behind | Last Committer | Last Commit Date | Status |")
    md_lines.append("| :--- | :---: | :---: | :--- | :--- | :--- |")
    
    for b in branch_report:
        status_str = "✅ Healthy"
        if b["has_conflict"]:
            status_str = "⚠️ CONFLICTS"
        elif b["behind"] > 20:
            status_str = "🔄 Stale (Pull Main)"
        elif b["ahead"] == 0:
            status_str = "💤 Idle (Fully Merged)"
            
        md_lines.append(f"| `{b['branch']}` | {b['ahead']} | {b['behind']} | {b['committer']} | {b['date'][:10]} | {status_str} |")
        
    md_lines.append("\n### Detailed Branch Analysis")
    for b in branch_report:
        if b["has_conflict"]:
            md_lines.append(f"#### ⚠️ Branch: `{b['branch']}` (Conflicts Detected)")
            md_lines.append(f"- **Last Commit:** {b['subject']}")
            md_lines.append("- **Conflicting Files:**")
            for f in b["conflicting_files"]:
                md_lines.append(f"  - `{f}`")
            md_lines.append("")
            
    md_lines.append("## 2. Codebase Standards Compliance Violations")
    md_lines.append(f"Found **{len(jpa_violations) + len(db_violations) + len(fe_violations)}** violations across JPA Entities, SQL Migrations, and React views.\n")
    
    md_lines.append("### A. Database Migration Scripts Violations")
    if db_violations:
        md_lines.append("| File | Path | Violation Type | Description |")
        md_lines.append("| :--- | :--- | :--- | :--- |")
        for v in db_violations:
            md_lines.append(f"| `{v['file']}` | [{os.path.basename(v['path'])}](file:///{os.path.abspath(v['path'])}) | {v['type']} | {v['message']} |")
    else:
        md_lines.append("✅ All database scripts conform to standard naming and audit requirements.")
    md_lines.append("")

    md_lines.append("### B. JPA Java Entities Violations")
    if jpa_violations:
        md_lines.append("| Class | Path | Violation Type | Description |")
        md_lines.append("| :--- | :--- | :--- | :--- |")
        for v in jpa_violations:
            md_lines.append(f"| `{v['file']}` | [{os.path.basename(v['path'])}](file:///{os.path.abspath(v['path'])}) | {v['type']} | {v['message']} |")
    else:
        md_lines.append("✅ All Java entities follow uppercase mappings and audit tracking.")
    md_lines.append("")

    md_lines.append("### C. Frontend BOS UI Standards Violations")
    if fe_violations:
        md_lines.append("| View File | Path | Violation Type | Description |")
        md_lines.append("| :--- | :--- | :--- | :--- |")
        for v in fe_violations:
            md_lines.append(f"| `{v['file']}` | [{os.path.basename(v['path'])}](file:///{os.path.abspath(v['path'])}) | {v['type']} | {v['message']} |")
    else:
        md_lines.append("✅ All scanned views conform to certified BOS component standards.")
    md_lines.append("")

    md_lines.append("## 3. Senior Developer Actionable Recommendations")
    md_lines.append("1. **Resolve Branch Staleness:** Instruct junior developers with branches that are >20 commits behind `main` (e.g., `NPD-module`) to immediately rebase or merge `main` into their feature branch to catch up and handle merge conflicts locally.")
    md_lines.append("2. **Version Control Strategy:** Mandate that migration script versions must be registered in a centralized Google Sheet or tracker before committing to prevent collisions (e.g., duplicate versions like V3.5, V4.18).")
    md_lines.append("3. **Centralized Entity Checks:** Integrate this script (`branch_health_audit.py`) as a pre-merge Git Hook or a CI task, blocking merges if any violations are found.")
    md_lines.append("4. **Enforce BOS UX Standards:** Refuse merge requests that contain raw `<table>` or raw browser `alert()` statements, directing developers to standard BOS equivalents.")

    # Write report file
    report_path = os.path.join(WORKSPACE_DIR, "branch_health_report.md")
    with open(report_path, "w", encoding="utf-8") as rf:
        rf.write("\n".join(md_lines))
        
    print(f"✅ Audit Report saved to: {report_path}")
    print(f"📊 Summary: {len(branch_report)} active developer branches analyzed.")
    print(f"🛑 Errors: {len(jpa_violations) + len(db_violations) + len(fe_violations)} violations logged.")

if __name__ == "__main__":
    generate_report()
