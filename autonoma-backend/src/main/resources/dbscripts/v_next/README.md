# 🧹 v_next Standardized Modules (DO NOT ADD FILES HERE)

This directory contains the **SQL Server-specific Consolidated Module Standardization scripts** (V001 to V009).

## ⚠️ Important Rules for Developers

1. **NO NEW FILES:** Do not add any new SQL scripts to this folder. All incremental scripts must go to the main `dbscripts/` directory.
2. **NO MANUAL EDITS:** These module scripts are generated baselines for renaming and normalizing legacy columns/tables. Do not edit them directly.
3. **AUTOMATIC EXECUTION:** The `SqlMigrationRunner` will run these scripts **AFTER** executing all incremental scripts in `dbscripts/*.sql`.
4. **H2 DEVELOPMENT MODE:** These scripts are automatically skipped on local H2 databases (since H2 has its own emulation logic). They are executed only on the SQL Server environment.

For any database schema changes, refer to the guide in [dbscripts/README.md](../README.md) and claim a version in [dbscripts/NEXT_VERSION.md](../NEXT_VERSION.md).
