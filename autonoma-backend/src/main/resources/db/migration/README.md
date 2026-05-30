# Database Schema Migration Guidelines

This directory contains the structured database migration scripts for the Autonoma ERP application. Follow these instructions to add new database schema changes.

---

## 📂 Directory Structure

Migrations are organized recursively by module name to keep files easy to locate:

```text
db/migration/
  ├── master/                 # Global configuration & core common tables
  ├── admin/                  # Users, sessions, roles, and settings
  ├── hra/                    # Employees, Induction, ATS, and HR Master tables
  ├── sm/                     # Vendors, Customers, Sales, and Transactions
  ├── qms/                    # Audits, Checklists, MOMs, Meetings, and NCRs
  └── npd/                    # Items, groups, types, capacity, and processes
```

---

## 📏 Naming Convention

All migration script files must follow this format:
`V<NNN>__<description>.sql`

* **`<NNN>`**: A three-digit sequential version number (padded with leading zeros). Example: `010`, `011`, `012`.
* **`<description>`**: A short description of the changes using snake_case. Example: `Add_Is_Active_To_Checklist_Assignment`.
* **Separator**: Ensure there are exactly **two underscores** (`__`) between the version number and the description.

Example Filename: `V010__Add_Is_Active_To_Checklist_Assignment.sql`

---

## 🚀 How to Add New Schema Changes

If your development task requires a change to the database schema (such as adding a column, modifying column types, or creating a new table):

1. **Do NOT modify any existing migration scripts.**
   * Scripts that have already been executed on the database will not run again. Modifying them causes schema drift and mismatch issues.
   
2. **Find the next sequential version number** by checking the highest version number currently in the repository (e.g., if the highest version is `V009`, your new script will be `V010`).
   
3. **Determine the target module folder** (e.g., if you are modifying a QMS table, use the `qms/` subdirectory).
   
4. **Create the new SQL script** in that folder (e.g., `db/migration/qms/V010__Add_Is_Active_To_Checklist_Assignment.sql`).
   
5. **Write defensive, guard-based SQL** to prevent errors during execution:
   * Always check if the column/table exists before running `ALTER` or `CREATE` statements (using `COL_LENGTH` and `OBJECT_ID`).
   * Wrap blocks with `BEGIN` and `END`, and terminate batches with `GO`.

   *Example SQL snippet:*
   ```sql
   IF OBJECT_ID('QMS_CHECKLIST_ASSIGNMENT', 'U') IS NOT NULL
   BEGIN
       IF COL_LENGTH('QMS_CHECKLIST_ASSIGNMENT', 'IS_ACTIVE') IS NULL
       BEGIN
           ALTER TABLE QMS_CHECKLIST_ASSIGNMENT ADD IS_ACTIVE BIT DEFAULT 1;
       END
   END
   GO
   ```

6. **Start the application backend.**
   * The custom `DbMigrationRunner` scans `db/migration/**/*.sql` recursively, sorts files alphabetically, executes any pending versions, and logs the progress.
