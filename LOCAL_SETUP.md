# Autonoma ERP — Local Setup Guide

> Last updated: May 2026 · Team: TIS (QMS / Audit / Checklist / Induction)

---

## Prerequisites

Install the following before you begin:

| Tool | Version | Download |
|------|---------|----------|
| **Java (JDK)** | 17 or 21 | https://adoptium.net |
| **Maven** | 3.9+ | https://maven.apache.org |
| **Node.js** | 18 or 20 | https://nodejs.org |
| **Docker Desktop** | Latest | https://docker.com |
| **Git** | Latest | https://git-scm.com |

> **Tip (macOS):** Install everything at once with Homebrew:
> ```bash
> brew install openjdk@21 maven node git
> brew install --cask docker
> ```

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Nutechwindparts/Autonoma_ERP.git
cd "Autonoma_ERP"
```

---

## Step 2 — Start SQL Server in Docker

We use **SQL Server 2022** running in Docker. Run this once:

```bash
docker run -d \
  --name autonoma-sqlserver \
  -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=Admin@1234" \
  -e "MSSQL_SA_PASSWORD=Admin@1234" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

Then create the database and user:

```bash
# Wait ~15 seconds for SQL Server to start, then run:
docker exec -it autonoma-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U SA -P "Admin@1234" -C -N -Q "
CREATE DATABASE AUTONOMA;
GO
CREATE LOGIN nutech WITH PASSWORD = 'nutech@2026';
GO
USE AUTONOMA;
GO
CREATE USER nutech FOR LOGIN nutech;
GO
ALTER ROLE db_owner ADD MEMBER nutech;
GO
PRINT 'Done';
"
```

> **Already set up?** Just start the container:
> ```bash
> docker start autonoma-sqlserver
> ```

---

## Step 3 — Configure the Backend

The backend config file is at:
```
autonoma-backend/src/main/resources/application.properties
```

Make sure these lines are **active** (not commented out):

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true;sendStringParametersAsUnicode=true;responseBuffering=adaptive
spring.datasource.username=nutech
spring.datasource.password=nutech@2026
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

And these H2 lines are **commented out**:

```properties
# spring.datasource.url=jdbc:h2:file:./db/AUTONOMA;...
# spring.datasource.driver-class-name=org.h2.Driver
```

---

## Step 4 — Run the Backend

```bash
cd autonoma-backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8081**

**What happens on first startup:**
- Spring Boot connects to SQL Server
- `SqlMigrationRunner` runs all pending `.sql` scripts from `src/main/resources/dbscripts/` automatically
- All QMS / Audit / Checklist / Induction tables are created and standardized
- No manual SQL execution needed

> ✅ Look for this in the logs:
> ```
> SQL MIGRATION COMPLETED FOR DYNAMIC TEMPLATE
> Started AutonomaBackendApplication in X seconds
> ```

---

## Step 5 — Run the Frontend

Open a **new terminal tab**:

```bash
cd autonoma-frontend
npm install        # only needed first time
npm start
```

The frontend starts on **http://localhost:3001**

---

## Step 6 — Log In

Open your browser at: **http://localhost:3001**

Use any existing credentials from the DB, or the default admin account seeded by the migrations.

---

## Everyday Workflow

```bash
# Terminal 1 — Backend
cd autonoma-backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd autonoma-frontend && npm start

# Start/stop Docker (keep data between restarts)
docker start autonoma-sqlserver
docker stop autonoma-sqlserver
```

---

## Migration System — How It Works

> **You never need to run SQL scripts manually.**

The app uses a custom `SqlMigrationRunner` that runs automatically at startup:

- Scripts are stored in `autonoma-backend/src/main/resources/dbscripts/`
- Each script runs **only once** — tracked in the `ERP_EXECUTED_SCRIPTS` table
- Scripts are **idempotent** — safe to re-run if something fails
- All scripts target **SQL Server only** — no H2 needed

**Adding a new migration script:**
1. Create a file in `dbscripts/` with the naming format:
   ```
   YYYYMMDD_VX.Y__Description__TIS.sql
   ```
   Example: `20260527_V40.0__Add_New_Feature__TIS.sql`
2. Write your T-SQL using `IF OBJECT_ID(...)` and `IF NOT EXISTS(...)` guards
3. Restart the backend — it runs automatically

---

## Database Naming Conventions (Our Team)

| What | Convention | Example |
|------|-----------|---------|
| Table names | UPPERCASE with module prefix | `QMS_AUDIT_SCHEDULE` |
| Column names | lowercase snake_case | `observation_id`, `created_date` |
| Audit date columns | `CREATED_DATE`, `UPDATED_DATE` | — |
| Audit user columns | `CREATED_USER`, `UPDATED_USER` | — |
| FK constraint names | `FK_[CHILD]_[PARENT]` | `FK_QMS_MOM_DETAIL_MASTER` |
| Module prefixes | QMS = Quality, IND = Induction | — |

---

## Troubleshooting

### ❌ "Login failed for user 'nutech'"
The DB user doesn't exist yet. Re-run Step 2's SQL commands.

### ❌ "Connection refused" on port 1433
Docker isn't running or the container is stopped:
```bash
docker start autonoma-sqlserver
```

### ❌ Backend crashes with a migration error
1. Check the `ERP_FAILED_SCRIPTS` table to see which script failed:
   ```sql
   SELECT * FROM ERP_FAILED_SCRIPTS ORDER BY FAILED_AT DESC;
   ```
2. Fix the script
3. Delete the failed entry and restart:
   ```sql
   DELETE FROM ERP_FAILED_SCRIPTS WHERE SCRIPT_NAME = 'your_script.sql';
   ```
4. Restart the backend — it will retry automatically

### ❌ Port 8081 already in use
Kill the existing process:
```bash
lsof -ti:8081 | xargs kill -9
```

### ❌ Port 3001 already in use
```bash
lsof -ti:3001 | xargs kill -9
```

### ❌ npm install fails
```bash
cd autonoma-frontend
rm -rf node_modules package-lock.json
npm install
```

### ❌ Maven build fails
```bash
cd autonoma-backend
mvn clean install -DskipTests
mvn spring-boot:run
```

---

## Verify Everything Is Working

Run these quick checks after startup:

```bash
# 1. Check backend is up
curl http://localhost:8081/actuator/health

# 2. Check SQL Server tables exist
docker exec autonoma-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U nutech -P "nutech@2026" -d AUTONOMA -C -N \
  -Q "SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"

# 3. Check migrations ran
docker exec autonoma-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U nutech -P "nutech@2026" -d AUTONOMA -C -N \
  -Q "SELECT TOP 5 SCRIPT_NAME, EXECUTED_AT FROM ERP_EXECUTED_SCRIPTS ORDER BY EXECUTED_AT DESC"
```

---

## Team Scope — What We Own

Only touch these modules (don't modify other devs' tables):

| Module | Table Prefix | Pages |
|--------|-------------|-------|
| QMS Audit | `QMS_AUDIT_*` | Audit Schedule, Observations, NCR/OFI |
| QMS Checklist | `QMS_CHECKLIST_*` | Checklist Master, Assignment, Verification |
| QMS Meeting | `QMS_MEETING_*`, `QMS_MOM_*` | Meeting Schedule, MOM |
| Induction | `IND_*` | Induction Master, Assignment, Training |

> ⚠️ **Do not touch:** Support Tickets, User Dashboard, or any `hrm_*` / `sm_*` tables not listed above.

---

## Questions?

Slack the TIS team or raise an issue on GitHub.
