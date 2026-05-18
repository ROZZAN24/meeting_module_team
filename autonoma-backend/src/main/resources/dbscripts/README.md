# Database Scripts Guide (`dbscripts`)

Welcome to the Autonoma ERP Database Schema Management workspace. This directory is the **single source of truth** for all database schema migrations, table structures, and seed data.

> [!IMPORTANT]
> **Flyway has been deprecated.** Do not create files inside `db/migration`. All database changes must be added here as SQL scripts following the standards below.

---

## 📌 1. Naming Convention

All scripts must be named using the following pattern:
```
[YYYYMMDD]_V[Version]__[Description].sql
```

### Examples:
* `20260512_V1.0__Initial_Full_Schema.sql`
* `20260518_V14.7__Create_NPD_Wind_Farm.sql`

* **`YYYYMMDD`**: The date the script was written. This ensures chronological order in file explorers.
* **`V[Version]`**: Flyway-style version number (e.g. `V14.7`, `V15.0.2`).
* **`__`**: Two underscores separating the version from the description.
* **`[Description]`**: A clear PascalCase or CamelCase description of the script's action.

---

## 🛡️ 2. Write Safe, Idempotent Scripts (Strict Rule)

Because these scripts are run directly against local or production databases, **every script must be completely idempotent** (safe to run multiple times without throwing errors or creating duplicates).

Always wrap your statements in existence checks:

### A. Creating Tables Safely
```sql
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[your_table_name]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[your_table_name] (
        [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        ...
    );
END
```

### B. Adding Columns Safely
```sql
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[your_table_name]') 
    AND name = 'new_column_name'
)
BEGIN
    ALTER TABLE [dbo].[your_table_name] ADD [new_column_name] NVARCHAR(50) NULL;
END
```

### C. Renaming Objects Safely
```sql
IF OBJECT_ID('OLD_TABLE_NAME', 'U') IS NOT NULL AND OBJECT_ID('new_table_name', 'U') IS NULL
BEGIN
    EXEC sp_rename 'OLD_TABLE_NAME', 'new_table_name';
END
```

---

## 🚀 3. How to Execute Scripts

### Option A: Local Dev Server Auto-Run
When you start the Spring Boot application locally (`./mvnw spring-boot:run`), our custom SQL runner automatically:
1. Scans this `dbscripts` folder.
2. Checks which scripts have already been applied to your database.
3. Automatically executes any **newly added** scripts in order.

### Option B: Manual Execution
To manually run scripts against your local SQL Server container:
1. Open your database client (DBeaver, Azure Data Studio, or SSMS).
2. Connect to local instance:
   * **Host**: `localhost`
   * **Port**: `1433` (or docker mapped port)
   * **Database**: `AUTONOMA`
   * **User**: `sa`
3. Open the `.sql` script and execute.

---

## 🤝 4. Best Practices for Developers
1. **Never edit an already pushed script.** If you need to make changes to a table that has already been created, create a new script with a new version number (e.g. `V14.7.1`) to append your changes.
2. **Always test locally** before pushing to `main` to ensure there are no SQL syntax or mapping mismatches.

---

## 👥 5. Multi-Company & Multi-Team Concurrent Work Protocol

Since multiple different development teams and companies (e.g. Nutech, Autonoma, and others) are co-developing this ERP repository, strict coordination is required to avoid git merge conflicts and database startup crashes.

### 🔄 Rule 1: The "Pull-First" Protocol
Before creating any database change script in your local feature branch, you **MUST**:
1. Pull the latest `main` branch: `git checkout main && git pull`
2. Check the `dbscripts/` folder to see the **highest version number** and **latest date prefix** checked in by other companies (e.g. if the highest version in `main` is `V18.1`, your new script should start at `V19.0` or `V18.2`).
3. Rebase or merge `main` into your feature branch *before* staging your new script.

### 🏷️ Rule 2: Suffix Namespaces for Concurrent Features
If two companies are developing custom modifications concurrently, append a team-based identifier suffix to the script description to prevent git rename collisions:
* **Example Team A (TIS)**: `20260518_V6.5__Hardening_Schema_Sync__TIS.sql`
* **Example Team B (Default)**: `20260518_V6.5__Hardening_Schema_Sync.sql`
* The custom backward-compatibility runner handles these suffixes cleanly without colliding!

### 💥 Rule 3: Zero Toleration for Raw DDL Commands
When another team pulls your code, their local Spring Boot server automatically attempts to execute your new SQL scripts. 
* **If you write a raw, unprotected command** (like `ALTER TABLE ADD column_name INT;`), and their database already has that column, **their backend server will crash on startup.**
* **CRITICAL REQUIREMENT**: Every table creation, column addition, database index, foreign key, or data insertion must be wrapped in `IF NOT EXISTS` guards (refer to **Section 2**).

