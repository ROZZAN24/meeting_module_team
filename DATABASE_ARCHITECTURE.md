# 🛡️ Autonoma ERP - Database Architecture & Governance

This document outlines the professional standards for the Autonoma ERP database environment, ensuring scalability, consistency, and team synchronization.

## 🏗️ Technology Stack
*   **Database Engine**: Microsoft SQL Server 2022 (Developer Edition)
*   **Migration Engine**: Flyway 10.x
*   **ORM**: Hibernate 6.x (JPA 3.x)
*   **Infrastructure**: Docker Compose

## 📏 Naming Conventions

### 1. Tables & Columns
*   **Table Names**: Uppercase, using underscores (e.g., `SM_CURRENCY`).
*   **Module Prefixes**:
    *   `SM_`: Sales & Marketing
    *   `HRM_`: Human Resource Management
    *   `QMS_`: Quality Management System
*   **Primary Keys**: Always `BIGINT IDENTITY(1,1)` with the name `id` (lowercase).
*   **Foreign Keys**: Standardized as `ENTITY_ID` (e.g., `CUSTOMER_ID`).

### 2. Migration Files
All migration files must follow the **TIS Project Standard**:
`V<Major>.<Minor>__<Description>__TIS.sql`
*Example*: `V7.0__Create_Sales_Marketing_Lookups__TIS.sql`

##  Development Workflow (Docker First)

All developers **MUST** use the Docker-managed MSSQL instance to ensure version parity.

### Syncing your local DB:
If your database schema falls out of sync, run:
```bash
docker-compose down -v && docker-compose up -d
```

## 🛡️ Flyway Governance

### 1. Integrity Rules
*   **NEVER** modify a migration file after it has been pushed to the repository.
*   If a schema change is needed, create a **NEW** migration file (e.g., `V7.1`).
*   Flyway checksums are monitored; any manual file edit will break the build.

### 2. Stabilization Settings
We have enabled `baseline-on-migrate=true`. 
*   **Benefit**: This allows Flyway to skip existing tables and only focus on new version increments.
*   **Constraint**: `spring.jpa.hibernate.ddl-auto` is set to `validate` to prevent Hibernate from making uncontrolled changes.

## 📊 Module-Specific Tables (S&M)
| Table Name | Description | Related Module |
| :--- | :--- | :--- |
| `SM_CURRENCY` | Global currency lookups | Sales & Marketing |
| `SM_SEGMENT` | Business sector segments | Sales & Marketing |
| `SM_PAYMENT_TERMS` | Financial terms for invoices | Sales & Marketing |
| `SM_TYPE_OF_SERVICE` | Service categorization | Sales & Marketing |

---
**Maintained by**: Autonoma Core Engineering Team
**Last Updated**: May 2026
