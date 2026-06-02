# ⛔ This folder is ARCHIVED — DO NOT ADD FILES HERE

**Status:** Archived stale copy  
**Archived on:** 2026-06-01  
**Reason:** This was a stale copy of backend migration scripts that lived inside the **frontend** project folder. It was never scanned or executed by the backend.

## What was this?

`autonoma-frontend/Autonoma_Backend/src/main/resources/dbscripts/` — this copy was accidentally maintained alongside the real backend scripts. Because the backend `SqlMigrationRunner` only scans `classpath:dbscripts/*.sql` from within the backend JAR, any scripts placed in the frontend directory **were completely ignored**.

## ✅ Where to put migration scripts

**One place only:**
```
autonoma-backend/src/main/resources/dbscripts/
```
