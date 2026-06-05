# ⛔ This folder is ARCHIVED — DO NOT ADD FILES HERE

**Status:** Dead / Disabled  
**Archived on:** 2026-06-01  
**Reason:** Flyway is disabled in `application.properties` (`spring.flyway.enabled=false`)

## What was this?

This was the original Flyway migration folder (`db/migration/`). It was used early in the project but was replaced by a custom `SqlMigrationRunner` to handle the legacy database structure.

**Any scripts placed here will NEVER be executed.**

## ✅ Where to put migration scripts

**One place only:**
```
autonoma-backend/src/main/resources/dbscripts/
```

See the `README.md` in that folder for the naming convention and rules.
