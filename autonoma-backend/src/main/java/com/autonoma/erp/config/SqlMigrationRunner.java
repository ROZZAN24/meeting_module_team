package com.autonoma.erp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Order(1)
public class SqlMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Scripts that contain heavy T-SQL (sys.columns, OBJECT_ID, COL_LENGTH, DECLARE @,
     * sp_executesql, cursors) and are effectively no-ops on a fresh H2 database.
     * These scripts handle column renaming, duplicate dropping, constraint manipulation,
     * and schema normalization that only matters on existing SQL Server databases.
     */
    private static final Set<String> H2_SKIP_SCRIPTS = new HashSet<>(Arrays.asList(
        // Column renaming (camelCase → snake_case) scripts
        "20260512_V3.5__Standardize_Audit_Schedule_Column_Names.sql",
        "20260512_V3.5.1__Standardize_Audit_Schedule_Column_Names.sql",
        "20260512_V3.6__Normalize_Schema_And_Drop_Duplicates.sql",
        "20260512_V3.6.1__Normalize_Schema_And_Drop_Duplicates.sql",
        "20260512_V3.7__Standardize_Remaining_Audit_Schedule_Columns.sql",
        "20260512_V3.7.1__Standardize_Remaining_Audit_Schedule_Columns.sql",
        "20260512_V3.8__Fix_Audit_Schedule_Criteria_Seq_No_Type.sql",
        "20260512_V3.9__Normalize_Audit_Observations_Schema.sql",
        "20260512_V3.9.1__Normalize_Audit_Observations_Schema.sql",
        "20260512_V4.5__QMS_Data_Consistency_Repair.sql",
        "20260512_V4.6__Emergency_Data_Cleanup.sql",
        "20260512_V4.7__Final_Audit_Schema_Normalization.sql",
        "20260512_V4.8__Repair_Department_Status.sql",
        "20260512_V4.9__Sync_Employee_And_Designation_Columns.sql",
        "20260512_V4.12__Harden_Employee_Schema_Nullable.sql",
        "20260512_V4.16__Normalize_Audit_Attendance_Columns.sql",
        "20260512_V4.17__Relax_NCR_Master_Constraints.sql",
        "20260512_V4.20__Add_Employee_Code_To_Audit_Attendance__TIS.sql",
        "20260512_V4.21__Add_Unique_Constraint_To_Audit_Attendance__TIS.sql",
        // TIS duplicates / forks
        "20260512_V5.1__Drop_Duplicate_Audit_Columns_TIS.sql",
        "20260512_V5.2__Standardize_Status_Values_TIS.sql",
        "20260512_V5.4__Add_Performance_Indexes_TIS.sql",
        "20260512_V5.5__Drop_Duplicate_Tables_TIS.sql",
        "20260512_V5.6__Sync_Employee_Master_Schema_TIS.sql",
        "20260518_V8.0__Schema_Cleanup_And_Normalization__TIS.sql",
        "20260518_V8.3__Standardize_Designation_Audit_Columns__TIS.sql",
        "20260518_V8.4__Update_Employee_Allowance_Types__TIS.sql",
        // Department code scripts
        "20260515_V10.1__Professionalize_Existing_Departments.sql",
        // Country/State audit sync
        "20260518_V14.8__Sync_Country_State_Audit.sql",
        // Checklist status migration (complex T-SQL with temp tables)
        "20260525_V37.0__Alter_Checklist_Status_To_Int.sql",
        // Team DB standardization
        "20260526_V38.0__Team_Database_Standardization__TIS.sql",
        "20260526_V39.0__Ats_Database_Standardization__TIS.sql"
    ));

    public SqlMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        runMigrations(this.jdbcTemplate);
    }

    public void runMigrations(JdbcTemplate targetJdbcTemplate) throws Exception {
        System.out.println("======================================");
        System.out.println("SQL MIGRATION STARTED FOR DYNAMIC TEMPLATE");
        System.out.println("======================================");

        createMigrationTables(targetJdbcTemplate);

        boolean isH2 = false;
        try {
            String url = targetJdbcTemplate.getDataSource().getConnection().getMetaData().getURL();
            if (url != null && url.contains(":h2:")) {
                isH2 = true;
            }
        } catch (Exception e) {
            // Default to false
        }

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        Resource[] resources = resolver.getResources("classpath:dbscripts/*.sql");

        List<Resource> sortedResources = Arrays.stream(resources)
                .sorted((r1, r2) -> {
                    String f1 = r1.getFilename();
                    String f2 = r2.getFilename();

                    if (f1 == null || f2 == null) {
                        return 0;
                    }

                    return f1.compareToIgnoreCase(f2);
                })
                .collect(Collectors.toList());

        for (Resource resource : sortedResources) {

            String fileName = resource.getFilename();

            try {

                if (isAlreadyExecuted(targetJdbcTemplate, fileName)) {
                    System.out.println("ALREADY EXECUTED : " + fileName);
                    continue;
                }

                System.out.println("EXECUTING : " + fileName);

                if (isH2) {
                    // Scripts that need custom Java emulation logic
                    boolean emulated = false;
                    if (fileName.equals("20260512_V4.2__Standardize_ERP_Naming_Convention_Final.sql")) {
                        emulateV4_2(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260512_V4.3__Normalize_All_Tables_Audit_Columns.sql")) {
                        emulateV4_3(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260512_V4.4__Global_Column_Lowercasing_Standardization.sql")) {
                        emulateV4_4(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260515_V6.0__Standardize_Audit_Infrastructure_And_Add_Masters.sql")) {
                        emulateV6_0(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260515_V10.0__Professional_Department_Codes.sql")) {
                        emulateV10_0(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260518_V8.1__Standardize_Audit_Infrastructure_And_Add_Masters__TIS.sql")) {
                        emulateV8_1(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260518_V8.6__Add_Audit_To_Remaining_Masters.sql")) {
                        emulateV8_6(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260516_V14.0__Standardize_Segment_Audit_Columns.sql")) {
                        emulateV14_0(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("20260518_V14.0.2__Standardize_Segment_Audit_Columns.sql")) {
                        emulateV14_0_2(targetJdbcTemplate);
                        emulated = true;
                    } else if (fileName.equals("V13.1__Seed_Default_Company_And_Division.sql")) {
                        emulateV13_1(targetJdbcTemplate);
                        emulated = true;
                    }


                    if (emulated) {
                        markAsExecuted(targetJdbcTemplate, fileName);
                        System.out.println("COMPLETED (EMULATED) : " + fileName);
                        continue;
                    }

                    // T-SQL standardization scripts that are pure no-ops on fresh H2
                    // (rename camelCase→snake_case, drop duplicates, fix column types, etc.)
                    if (H2_SKIP_SCRIPTS.contains(fileName)) {
                        markAsExecuted(targetJdbcTemplate, fileName);
                        System.out.println("COMPLETED (H2 SKIP - T-SQL ONLY) : " + fileName);
                        continue;
                    }
                }

                String sql = readSqlFile(resource);

                sql = removeUseStatements(sql);

                List<String> batches;
                if (isH2) {
                    sql = translateSqlForH2(sql);
                    batches = splitSqlBySemicolon(sql);
                } else {
                    batches = Arrays.asList(sql.split("(?im)^\\s*GO\\s*$"));
                }
                final List<String> finalBatches = batches;
                targetJdbcTemplate.execute((java.sql.Connection con) -> {
                    try (java.sql.Statement stmt = con.createStatement()) {
                        for (String batch : finalBatches) {
                            if (batch == null || batch.trim().isEmpty()) {
                                continue;
                            }
                            if (shouldSkipBatch(targetJdbcTemplate, batch)) {
                                System.out.println("SKIPPED BATCH");
                                continue;
                            }
                            try {
                                stmt.execute(batch);
                            } catch (java.sql.SQLException se) {
                                System.err.println("##############################################################################");
                                System.err.println("#                      DATABASE MIGRATION BATCH ERROR                        #");
                                System.err.println("##############################################################################");
                                System.err.println("# FILE: " + fileName);
                                System.err.println("# ERROR: " + se.getMessage());
                                System.err.println("# BATCH: " + batch);
                                System.err.println("##############################################################################");
                                throw new java.sql.SQLException("Database migration batch failed in file: " + fileName + ". Reason: " + se.getMessage(), se);
                            }
                        }
                    }
                    return null;
                });

                if (isH2 && fileName.equals("20260518_V8.2__Deep_Sync_And_Missing_Tables__TIS.sql")) {
                    ensureAuditColumns(targetJdbcTemplate, "sm_enquiry");
                    ensureAuditColumns(targetJdbcTemplate, "sm_quotation");
                    ensureAuditColumns(targetJdbcTemplate, "sm_supplier_master");
                    ensureAuditColumns(targetJdbcTemplate, "sm_subcontractor_master");
                    ensureAuditColumns(targetJdbcTemplate, "hrm_designation_master");
                }

                markAsExecuted(targetJdbcTemplate, fileName);

                System.out.println("COMPLETED : " + fileName);

            } catch (Exception e) {

                System.err.println("##############################################################################");
                System.err.println("#                      DATABASE MIGRATION FILE FAILED                        #");
                System.err.println("##############################################################################");
                System.err.println("# FILE: " + fileName);
                System.err.println("# ERROR: " + e.getMessage());
                System.err.println("##############################################################################");
                e.printStackTrace(System.err);

                insertFailedScript(targetJdbcTemplate, fileName, e.getMessage());
                throw new RuntimeException("Database migration failed on script: " + fileName + ". Reason: " + e.getMessage(), e);
            }
        }

        System.out.println("======================================");
        System.out.println("SQL MIGRATION COMPLETED FOR DYNAMIC TEMPLATE");
        System.out.println("======================================");
    }

    private void createMigrationTables(JdbcTemplate targetJdbcTemplate) {
        boolean isH2 = false;
        try {
            String url = targetJdbcTemplate.getDataSource().getConnection().getMetaData().getURL();
            if (url != null && url.contains(":h2:")) {
                isH2 = true;
            }
        } catch (Exception e) {
            // Default to SQL Server if check fails
        }

        if (isH2) {
            targetJdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS ERP_EXECUTED_SCRIPTS (
                    ID BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    SCRIPT_NAME VARCHAR(500) UNIQUE,
                    EXECUTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);

            targetJdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS ERP_FAILED_SCRIPTS (
                    ID BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    SCRIPT_NAME VARCHAR(500),
                    ERROR_MESSAGE CLOB,
                    FAILED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);
        } else {


            targetJdbcTemplate.execute("""
                        IF OBJECT_ID('ERP_EXECUTED_SCRIPTS', 'U') IS NULL
                        BEGIN
                            CREATE TABLE ERP_EXECUTED_SCRIPTS (
                                ID BIGINT IDENTITY(1,1) PRIMARY KEY,
                                SCRIPT_NAME NVARCHAR(500) UNIQUE,
                                EXECUTED_AT DATETIME DEFAULT GETDATE()
                            )
                        END
                    """);

            targetJdbcTemplate.execute("""
                        IF OBJECT_ID('ERP_FAILED_SCRIPTS', 'U') IS NULL
                        BEGIN
                            CREATE TABLE ERP_FAILED_SCRIPTS (
                                ID BIGINT IDENTITY(1,1) PRIMARY KEY,
                                SCRIPT_NAME NVARCHAR(500),
                                ERROR_MESSAGE NVARCHAR(MAX),
                                FAILED_AT DATETIME DEFAULT GETDATE()
                            )
                        END
                    """);
        }
    }


    private boolean isAlreadyExecuted(JdbcTemplate targetJdbcTemplate, String fileName) {

        Integer count = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ERP_EXECUTED_SCRIPTS WHERE SCRIPT_NAME = ?",
                Integer.class,
                fileName);

        if (count != null && count > 0) {
            return true;
        }

        // Backward compatibility: If the file is date-prefixed (e.g. 20260512_V3.4_1__...),
        // check if it has already been executed under its old unprefixed name.
        if (fileName != null && fileName.matches("^\\d{8}_.*")) {
            String suffixName = fileName.substring(9); // strip YYYYMMDD_ (9 chars)
            Integer suffixCount = targetJdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM ERP_EXECUTED_SCRIPTS WHERE SCRIPT_NAME = ?",
                    Integer.class,
                    suffixName);
            if (suffixCount != null && suffixCount > 0) {
                // Self-healing: mark the new prefixed name as executed to prevent redundant queries in the future
                try {
                    markAsExecuted(targetJdbcTemplate, fileName);
                } catch (Exception e) {
                    // Ignore constraint/duplicate issues
                }
                return true;
            }
        }

        return false;
    }

    private void markAsExecuted(JdbcTemplate targetJdbcTemplate, String fileName) {

        targetJdbcTemplate.update(
                "INSERT INTO ERP_EXECUTED_SCRIPTS (SCRIPT_NAME) VALUES (?)",
                fileName);
    }

    private void insertFailedScript(JdbcTemplate targetJdbcTemplate, String fileName, String errorMessage) {

        targetJdbcTemplate.update(
                "INSERT INTO ERP_FAILED_SCRIPTS (SCRIPT_NAME, ERROR_MESSAGE) VALUES (?, ?)",
                fileName,
                errorMessage);
    }

    private String readSqlFile(Resource resource) throws Exception {

        return new BufferedReader(
                new InputStreamReader(
                        resource.getInputStream(),
                        StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));
    }

    private String removeUseStatements(String sql) {

        return sql.replaceAll(
                "(?im)^\\s*USE\\s+[\\[\\]a-zA-Z0-9_]+;?\\s*$",
                "");
    }

    private boolean shouldSkipBatch(JdbcTemplate targetJdbcTemplate, String sql) {

        try {

            String upperSql = sql.toUpperCase();

            // System catalog checks: skip any T-SQL batch referencing SQL Server sys catalogs
            if (upperSql.contains("SYS.COLUMNS") 
                    || upperSql.contains("SYS.OBJECTS") 
                    || upperSql.contains("SYS.DEFAULT_CONSTRAINTS") 
                    || upperSql.contains("SYS.INDEXES") 
                    || upperSql.contains("SYS.FOREIGN_KEYS") 
                    || upperSql.contains("SYS.TABLES") 
                    || upperSql.contains("SYS.SCHEMAS")
                    || upperSql.contains("SYS.TYPES")) {
                System.out.println("SYSTEM CATALOG CHECK SKIPPED");
                return true;
            }

            // ALTER TABLE CHECK: Skip if the target table does not exist in H2 database
            // ALTER TABLE CHECK: Skip if the target table does not exist in H2 database
            if (upperSql.contains("ALTER TABLE")) {
                String tableName = extractTableNameFromAlter(sql);
                if (tableName != null && !isTableExists(targetJdbcTemplate, tableName)) {
                    System.out.println("TABLE DOES NOT EXIST (ALTER TABLE SKIPPED): " + tableName);
                    return true;
                }
            }

            // UPDATE CHECK: Skip if target table does not exist
            if (upperSql.contains("UPDATE ") && !upperSql.contains("ON UPDATE ")) {
                String tableName = extractTableNameFromUpdate(sql);
                if (tableName != null && !isTableExists(targetJdbcTemplate, tableName)) {
                    System.out.println("TABLE DOES NOT EXIST (UPDATE SKIPPED): " + tableName);
                    return true;
                }
            }

            // INSERT CHECK: Skip if target table does not exist
            if (upperSql.contains("INSERT INTO ") || upperSql.contains("INSERT ")) {
                String tableName = extractTableNameFromInsert(sql);
                if (tableName != null && !isTableExists(targetJdbcTemplate, tableName)) {
                    System.out.println("TABLE DOES NOT EXIST (INSERT SKIPPED): " + tableName);
                    return true;
                }
            }

            // DELETE CHECK: Skip if target table does not exist
            if ((upperSql.contains("DELETE FROM ") || upperSql.contains("DELETE ")) && !upperSql.contains("ON DELETE ")) {
                String tableName = extractTableNameFromDelete(sql);
                if (tableName != null && !isTableExists(targetJdbcTemplate, tableName)) {
                    System.out.println("TABLE DOES NOT EXIST (DELETE SKIPPED): " + tableName);
                    return true;
                }
            }

            // ALTER TABLE ADD COLUMN CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains(" ADD ")) {

                String tableName = extractTableName(sql);

                String columnName = extractColumnName(sql);

                if (tableName != null && columnName != null) {

                    Integer count = targetJdbcTemplate.queryForObject("""
                                SELECT COUNT(*)
                                FROM INFORMATION_SCHEMA.COLUMNS
                                WHERE TABLE_NAME = ?
                                AND COLUMN_NAME = ?
                            """, Integer.class, tableName.toUpperCase(), columnName.toUpperCase());

                    if (count != null && count > 0) {

                        System.out.println(
                                "COLUMN ALREADY EXISTS : "
                                        + tableName + "." + columnName);

                        return true;
                    }
                }
            }

            // ALTER TABLE RENAME TO CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains("RENAME TO")) {
                int renameIndex = upperSql.indexOf("RENAME TO");
                String targetTablePart = sql.substring(renameIndex + 9).trim();
                if (targetTablePart.endsWith(";")) {
                    targetTablePart = targetTablePart.substring(0, targetTablePart.length() - 1).trim();
                }
                String targetTable = targetTablePart.split("\\s+")[0]
                        .replace("[", "")
                        .replace("]", "")
                        .replace("dbo.", "")
                        .trim();

                Integer count = targetJdbcTemplate.queryForObject("""
                            SELECT COUNT(*)
                            FROM INFORMATION_SCHEMA.TABLES
                            WHERE TABLE_NAME = ?
                        """, Integer.class, targetTable.toUpperCase());

                if (count != null && count > 0) {
                    System.out.println("TABLE ALREADY EXISTS (RENAME TO SKIPPED): " + targetTable);
                    return true;
                }
            }

            // ALTER TABLE RENAME COLUMN CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains("RENAME COLUMN")) {
                String tableName = extractTableNameForRenameColumn(sql);
                String targetColumn = extractTargetColumnForRenameColumn(sql);
                String sourceColumn = extractSourceColumnForRenameColumn(sql);

                if (tableName != null && targetColumn != null) {
                    Integer count = targetJdbcTemplate.queryForObject("""
                                SELECT COUNT(*)
                                FROM INFORMATION_SCHEMA.COLUMNS
                                WHERE TABLE_NAME = ?
                                AND COLUMN_NAME = ?
                            """, Integer.class, tableName.toUpperCase(), targetColumn.toUpperCase());

                    if (count != null && count > 0) {
                        System.out.println("COLUMN ALREADY RENAMED : " + tableName + "." + targetColumn);
                        return true;
                    }

                    if (sourceColumn != null) {
                        Integer sourceCount = targetJdbcTemplate.queryForObject("""
                                    SELECT COUNT(*)
                                    FROM INFORMATION_SCHEMA.COLUMNS
                                    WHERE TABLE_NAME = ?
                                    AND COLUMN_NAME = ?
                                """, Integer.class, tableName.toUpperCase(), sourceColumn.toUpperCase());
                        if (sourceCount == null || sourceCount == 0) {
                            System.out.println("SOURCE COLUMN DOES NOT EXIST (RENAME COLUMN SKIPPED): " + tableName + "." + sourceColumn);
                            return true;
                        }
                    }
                }
            }

            // ALTER TABLE DROP COLUMN CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains("DROP COLUMN")) {
                String tableName = extractTableNameFromAlter(sql);
                String columnName = extractColumnNameForDrop(sql);

                if (tableName != null && columnName != null) {
                    Integer count = targetJdbcTemplate.queryForObject("""
                                SELECT COUNT(*)
                                FROM INFORMATION_SCHEMA.COLUMNS
                                WHERE TABLE_NAME = ?
                                AND COLUMN_NAME = ?
                            """, Integer.class, tableName.toUpperCase(), columnName.toUpperCase());

                    if (count == null || count == 0) {
                        System.out.println("COLUMN DOES NOT EXIST (DROP COLUMN SKIPPED): " + tableName + "." + columnName);
                        return true;
                    }
                }
            }

            // ALTER TABLE ALTER COLUMN CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains("ALTER COLUMN")) {
                String tableName = extractTableNameFromAlter(sql);
                String columnName = extractColumnNameForAlterColumn(sql);

                if (tableName != null && columnName != null) {
                    Integer count = targetJdbcTemplate.queryForObject("""
                                SELECT COUNT(*)
                                FROM INFORMATION_SCHEMA.COLUMNS
                                WHERE TABLE_NAME = ?
                                AND COLUMN_NAME = ?
                            """, Integer.class, tableName.toUpperCase(), columnName.toUpperCase());

                    if (count == null || count == 0) {
                        System.out.println("COLUMN DOES NOT EXIST (ALTER COLUMN SKIPPED): " + tableName + "." + columnName);
                        return true;
                    }
                }
            }

            // ALTER TABLE ADD CONSTRAINT CHECK
            if (upperSql.contains("ALTER TABLE")
                    && upperSql.contains("ADD CONSTRAINT")) {
                String constraintName = extractConstraintName(sql);

                if (constraintName != null) {
                    Integer count = targetJdbcTemplate.queryForObject("""
                                SELECT COUNT(*)
                                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
                                WHERE CONSTRAINT_NAME = ?
                            """, Integer.class, constraintName.toUpperCase());

                    if (count != null && count > 0) {
                        System.out.println("CONSTRAINT ALREADY EXISTS : " + constraintName);
                        return true;
                    }
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "VALIDATION FAILED : " + e.getMessage());
        }

        return false;
    }

    private boolean isTableExists(JdbcTemplate targetJdbcTemplate, String tableName) {
        if (tableName == null || tableName.trim().isEmpty()) {
            return false;
        }
        try {
            Integer count = targetJdbcTemplate.queryForObject("""
                        SELECT COUNT(*)
                        FROM INFORMATION_SCHEMA.TABLES
                        WHERE TABLE_NAME = ?
                    """, Integer.class, tableName.trim().toUpperCase());
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String extractTableNameFromUpdate(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int updateIndex = upperSql.indexOf("UPDATE ");
            if (updateIndex == -1) {
                return null;
            }
            String afterUpdate = sql.substring(updateIndex + 7).trim();
            String firstToken = afterUpdate.split("\\s+")[0];
            return firstToken
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractTableNameFromInsert(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int insertIndex = upperSql.indexOf("INSERT ");
            if (insertIndex == -1) {
                return null;
            }
            String afterInsert = sql.substring(insertIndex + 7).trim();
            if (afterInsert.toUpperCase().startsWith("INTO ")) {
                afterInsert = afterInsert.substring(5).trim();
            }
            String firstToken = afterInsert.split("\\s+")[0];
            return firstToken
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractTableNameFromDelete(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int deleteIndex = upperSql.indexOf("DELETE ");
            if (deleteIndex == -1) {
                return null;
            }
            String afterDelete = sql.substring(deleteIndex + 7).trim();
            if (afterDelete.toUpperCase().startsWith("FROM ")) {
                afterDelete = afterDelete.substring(5).trim();
            }
            String firstToken = afterDelete.split("\\s+")[0];
            return firstToken
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractTableName(String sql) {

        try {

            String upperSql = sql.toUpperCase();

            int alterIndex = upperSql.indexOf("ALTER TABLE");

            int addIndex = upperSql.indexOf(" ADD ");

            if (alterIndex == -1 || addIndex == -1) {
                return null;
            }

            return sql.substring(alterIndex + 11, addIndex)
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();

        } catch (Exception e) {

            return null;
        }
    }

    private String extractTableNameFromAlter(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int alterIndex = upperSql.indexOf("ALTER TABLE");
            if (alterIndex == -1) {
                return null;
            }
            String afterAlter = sql.substring(alterIndex + 11).trim();
            String firstToken = afterAlter.split("\\s+")[0];
            return firstToken
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractSourceColumnForRenameColumn(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int renameIndex = upperSql.indexOf("RENAME COLUMN");
            int toIndex = upperSql.indexOf(" TO ");
            if (renameIndex == -1 || toIndex == -1) {
                return null;
            }
            return sql.substring(renameIndex + 13, toIndex)
                    .replace("[", "")
                    .replace("]", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractColumnNameForDrop(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int dropIndex = upperSql.indexOf("DROP COLUMN");
            if (dropIndex == -1) {
                return null;
            }
            String colPart = sql.substring(dropIndex + 11).trim();
            return colPart.split("\\s+")[0]
                    .replace("[", "")
                    .replace("]", "")
                    .replace(";", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractColumnNameForAlterColumn(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int alterColIndex = upperSql.indexOf("ALTER COLUMN");
            if (alterColIndex == -1) {
                return null;
            }
            String colPart = sql.substring(alterColIndex + 12).trim();
            return colPart.split("\\s+")[0]
                    .replace("[", "")
                    .replace("]", "")
                    .replace(";", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractColumnName(String sql) {

        try {

            String upperSql = sql.toUpperCase();

            int addIndex = upperSql.indexOf(" ADD ");

            if (addIndex == -1) {
                return null;
            }

            String columnPart = sql.substring(addIndex + 5).trim();

            return columnPart.split("\\s+")[0]
                    .replace("[", "")
                    .replace("]", "")
                    .replace("(", "")
                    .replace(")", "")
                    .replace(",", "")
                    .trim();

        } catch (Exception e) {

            return null;
        }
    }

    private String extractTableNameForRenameColumn(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int alterIndex = upperSql.indexOf("ALTER TABLE");
            int renameIndex = upperSql.indexOf("RENAME COLUMN");
            if (alterIndex == -1 || renameIndex == -1) {
                return null;
            }
            return sql.substring(alterIndex + 11, renameIndex)
                    .replace("[", "")
                    .replace("]", "")
                    .replace("dbo.", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractTargetColumnForRenameColumn(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int toIndex = upperSql.indexOf(" TO ");
            if (toIndex == -1) {
                return null;
            }
            String colPart = sql.substring(toIndex + 4).trim();
            if (colPart.endsWith(";")) {
                colPart = colPart.substring(0, colPart.length() - 1).trim();
            }
            return colPart.split("\\s+")[0]
                    .replace("[", "")
                    .replace("]", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractConstraintName(String sql) {
        try {
            String upperSql = sql.toUpperCase();
            int addIndex = upperSql.indexOf("ADD CONSTRAINT");
            if (addIndex == -1) {
                return null;
            }
            String part = sql.substring(addIndex + 14).trim();
            return part.split("\\s+")[0]
                    .replace("[", "")
                    .replace("]", "")
                    .trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String translateSqlForH2(String sql) {
        if (sql == null) {
            return null;
        }

        // Clean up dbo prefix and brackets at the start for regex ease
        sql = sql.replace("[dbo].", "");
        sql = sql.replace("dbo.", "");
        sql = sql.replace("[", "").replace("]", "");

        // Remove ANSI_NULLS and QUOTED_IDENTIFIER SET statements
        sql = sql.replaceAll("(?is)SET\\s+ANSI_NULLS\\s+(ON|OFF)\\s*;?", "");
        sql = sql.replaceAll("(?is)SET\\s+QUOTED_IDENTIFIER\\s+(ON|OFF)\\s*;?", "");
        sql = sql.replaceAll("(?is)SET\\s+IDENTITY_INSERT\\s+\\S+\\s+(ON|OFF)\\s*;?", "");

        // Remove single line comments
        sql = sql.replaceAll("--.*?\\n", "\n");
        // Remove block comments
        sql = sql.replaceAll("(?s)/\\*.*?\\*/", "");

        // Remove PRINT statements
        sql = sql.replaceAll("(?is)\\bPRINT\\b\\s+[^;\\n\\r]+;?", "");

        // Remove GO statements
        sql = sql.replaceAll("(?i)\\bGO\\b", "");

        // Remove T-SQL cursor blocks completely
        sql = sql.replaceAll("(?is)DECLARE\\s+\\S+\\s+CURSOR\\b.*?DEALLOCATE\\s+\\S+\\s*;?", "");

        // Remove statements querying SQL Server system catalogs (standalone SELECT/EXEC only)
        sql = sql.replaceAll("(?is)(?:^|;)\\s*(?:SELECT|EXEC)\\s+[^;]*?\\bsys\\.(?:columns|objects|default_constraints|indexes|foreign_keys|tables|syscomments)\\b[^;]*?;", ";");

        // Remove standard T-SQL variable declarations, including initial values
        sql = sql.replaceAll("(?is)DECLARE\\s+@[a-zA-Z0-9_]+\\s+[a-zA-Z0-9_()]+\\s*(?:=\\s*[^;]+)?\\s*;?", "");

        // Translate SELECT @var = col FROM tbl WHERE cond to H2 SET @var = (SELECT col FROM tbl WHERE cond)
        sql = sql.replaceAll("(?is)\\bSELECT\\s+(?:TOP\\s+\\d+\\s+)?@([a-zA-Z0-9_]+)\\s*=\\s*([a-zA-Z0-9_]+)\\s+FROM\\s+([a-zA-Z0-9_]+)\\s+WHERE\\s+([^;\\n\\r]+);?", "SET @$1 = (SELECT $2 FROM $3 WHERE $4);");

        // Translate SELECT @var = col FROM tbl (no WHERE) to H2 SET @var = (SELECT MIN(col) FROM tbl)
        sql = sql.replaceAll("(?is)\\bSELECT\\s+(?:TOP\\s+\\d+\\s+)?@([a-zA-Z0-9_]+)\\s*=\\s*([a-zA-Z0-9_]+)\\s+FROM\\s+([a-zA-Z0-9_]+);?", "SET @$1 = (SELECT MIN($2) FROM $3);");

        // Strip T-SQL IF @var IS NULL SELECT/SET statements
        sql = sql.replaceAll("(?is)\\bIF\\s+@[a-zA-Z0-9_]+\\s+IS\\s+NULL\\s+(?:SELECT|SET)\\b[^;]+;?", "");

        // Remove EXEC sp_executesql @var or EXEC @var
        sql = sql.replaceAll("(?is)\\bEXEC\\s+(?:sp_executesql\\s+)?@[a-zA-Z0-9_]+\\s*;?", "");

        // Remove #RenameCol stored procedure definition
        sql = sql.replaceAll("(?is)IF\\s+OBJECT_ID\\('tempdb\\.\\.#RenameCol'\\)[^;]*;?", "");
        sql = sql.replaceAll("(?is)CREATE\\s+PROCEDURE\\s+#RenameCol\\b.*?END\\s+GO", "");
        sql = sql.replaceAll("(?is)DROP\\s+PROCEDURE\\s+#RenameCol\\s*;?", "");

        // Translate EXEC #RenameCol 'table', 'old', 'new' calls to standard H2 RENAME COLUMN
        sql = sql.replaceAll("(?is)\\bEXEC\\s+#RenameCol\\s+'([a-zA-Z0-9_]+)',\\s*'([a-zA-Z0-9_]+)',\\s*'([a-zA-Z0-9_]+)'\\s*;?", "; ALTER TABLE $1 RENAME COLUMN $2 TO $3;");

        // Remove #AddCol stored procedure definition
        sql = sql.replaceAll("(?is)IF\\s+OBJECT_ID\\('tempdb\\.\\.#AddCol'\\)[^;]*;?", "");
        sql = sql.replaceAll("(?is)CREATE\\s+PROCEDURE\\s+#AddCol\\b.*?END\\s*(?=EXEC\\s+#AddCol\\b)", "");
        sql = sql.replaceAll("(?is)DROP\\s+PROCEDURE\\s+#AddCol\\s*;?", "");

        // Translate VARCHAR(MAX) and NVARCHAR(MAX) to CLOB for H2
        sql = sql.replaceAll("(?is)\\b(?:N?VARCHAR|N?CHAR)\\s*\\(\\s*MAX\\s*\\)", "CLOB");

        // Translate EXEC #AddCol 'table', 'col', 'type' calls and unescape inner single quotes
        {
            java.util.regex.Pattern addColPattern = java.util.regex.Pattern.compile("(?is)\\bEXEC\\s+#AddCol\\s+'([a-zA-Z0-9_]+)',\\s*'([a-zA-Z0-9_]+)',\\s*'((?:''|[^'])+)'");
            java.util.regex.Matcher addColMatcher = addColPattern.matcher(sql);
            StringBuilder sb = new StringBuilder();
            while (addColMatcher.find()) {
                String tableName = addColMatcher.group(1);
                String colName = addColMatcher.group(2);
                String colDef = addColMatcher.group(3);
                colDef = colDef.replace("''", "'");
                addColMatcher.appendReplacement(sb, "; ALTER TABLE " + tableName + " ADD " + colName + " " + colDef + ";");
            }
            addColMatcher.appendTail(sb);
            sql = sb.toString();
        }

        // Translate EXEC sp_rename for columns: EXEC sp_rename 'table.old_col', 'new_col', 'COLUMN'
        sql = sql.replaceAll("(?is)\\bEXEC\\s+sp_rename\\s+'([a-zA-Z0-9_]+)\\.([a-zA-Z0-9_]+)',\\s*'([a-zA-Z0-9_]+)',\\s*'COLUMN'\\s*;?", "; ALTER TABLE $1 RENAME COLUMN $2 TO $3;");

        // Translate EXEC sp_rename for tables: EXEC sp_rename 'old_table', 'new_table'
        sql = sql.replaceAll("(?is)\\bEXEC\\s+sp_rename\\s+'([a-zA-Z0-9_]+)',\\s*'([a-zA-Z0-9_]+)'\\s*;?", "; ALTER TABLE $1 RENAME TO $2;");

        // Remove IF NOT EXISTS / IF EXISTS wrappers completely (lazy match up to BEGIN)
        sql = sql.replaceAll("(?is)IF\\s+(NOT\\s+)?EXISTS\\s*\\(.*?\\)\\s*BEGIN", "");

        // Remove matching END blocks (replace with semicolon to ensure termination)
        sql = sql.replaceAll("(?is)\\bEND\\b", ";");

        // Remove T-SQL IF wrappers prefixing statements (e.g. IF NOT EXISTS ... ALTER TABLE)
        sql = sql.replaceAll("(?is)\\bIF\\s+(?:NOT\\s+)?(?:OBJECT_ID|COL_LENGTH|EXISTS)\\s*\\(.*?\\)\\s*.*?\\b(EXEC|ALTER|CREATE|INSERT|UPDATE|DELETE|DROP)\\b", "$1");

        // Translate IF COL_LENGTH(...) IS NOT NULL ... EXEC('sql')
        sql = sql.replaceAll(
            "(?is)IF\\s+COL_LENGTH\\(.*?\\)\\s+IS\\s+NOT\\s+NULL(?:\\s+AND\\s+COL_LENGTH\\(.*?\\)\\s+IS\\s+NOT\\s+NULL)?\\s+EXEC\\s*\\(\\s*'(.*?)'\\s*\\)",
            "$1"
        );

        // Translate EXEC sp_executesql N'sql' and unescape inner single quotes
        {
            java.util.regex.Pattern spPattern = java.util.regex.Pattern.compile("(?is)\\bEXEC\\s+sp_executesql\\s+N?'((?:''|[^'])*)'");
            java.util.regex.Matcher spMatcher = spPattern.matcher(sql);
            StringBuilder sb = new StringBuilder();
            while (spMatcher.find()) {
                String innerSql = spMatcher.group(1);
                innerSql = innerSql.replace("''", "'");
                spMatcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(innerSql));
            }
            spMatcher.appendTail(sb);
            sql = sb.toString();
        }

        // Translate EXEC('sql') and unescape inner single quotes
        {
            java.util.regex.Pattern execPattern = java.util.regex.Pattern.compile("(?is)\\bEXEC\\s*\\(\\s*'((?:''|[^'])*)'\\s*\\)");
            java.util.regex.Matcher execMatcher = execPattern.matcher(sql);
            StringBuilder sb = new StringBuilder();
            while (execMatcher.find()) {
                String innerSql = execMatcher.group(1);
                innerSql = innerSql.replace("''", "'");
                execMatcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(innerSql));
            }
            execMatcher.appendTail(sb);
            sql = sb.toString();
        }

        // Remove ELSE BEGIN and ELSE statements completely on H2 (replace with semicolon)
        sql = sql.replaceAll("(?is)\\bELSE\\s+BEGIN\\b", ";");
        sql = sql.replaceAll("(?is)\\bELSE\\b", ";");

        // Remove ON [PRIMARY] and ON PRIMARY
        sql = sql.replaceAll("(?is)\\bON\\s+PRIMARY", "");
        sql = sql.replaceAll("(?is)\\bTEXTIMAGE_ON\\s+PRIMARY", "");

        // Remove CLUSTERED keyword
        sql = sql.replaceAll("(?is)\\bCLUSTERED\\b", "");

        // Translate inline T-SQL "FOREIGN KEY REFERENCES" to standard "REFERENCES"
        sql = sql.replaceAll("(?is)\\bFOREIGN\\s+KEY\\s+REFERENCES\\b", "REFERENCES");

        // Remove index options WITH (...)
        sql = sql.replaceAll("(?is)\\bWITH\\s*\\(\\s*(PAD_INDEX|ALLOW_ROW_LOCKS|FILLFACTOR|DATA_COMPRESSION)[^)]*\\)", "");

        // Remove WITH CHECK and WITH NOCHECK
        sql = sql.replaceAll("(?is)\\bWITH\\s+(CHECK|NOCHECK)\\b", "");

        // Remove ALTER TABLE ... CHECK/NOCHECK CONSTRAINT ...
        sql = sql.replaceAll("(?is)\\bALTER\\s+TABLE\\s+\\S+\\s+(CHECK|NOCHECK)\\s+CONSTRAINT\\s+\\S+\\b;?", "");


        // Prepend semicolons to key statements so they are split correctly
        sql = sql.replaceAll("(?is)\\b(CREATE\\s+TABLE|ALTER\\s+TABLE|INSERT\\s+(INTO\\s+)?)\\b", "; $1");

        // Translate ALTER TABLE ... ADD multiple columns for H2 by wrapping them in parentheses
        sql = sql.replaceAll(
            "(?is)\\bALTER\\s+TABLE\\s+(\\S+)\\s+ADD\\s+(?!\\s*\\(|\\s*CONSTRAINT\\b|\\s*DEFAULT\\b|\\s*FOREIGN\\b|\\s*PRIMARY\\b|\\s*UNIQUE\\b|\\s*COLUMN\\b)([^;]+)",
            "ALTER TABLE $1 ADD ($2)"
        );

        // Remove statements querying SQL Server system catalogs (standalone SELECT/EXEC only) - Now deprecated in favor of dynamic shouldSkipBatch checks

        // Translate ALTER TABLE ... ADD DEFAULT (val) FOR col
        sql = sql.replaceAll(
            "(?is)ALTER\\s+TABLE\\s+([a-zA-Z0-9_]+)\\s+ADD\\s+DEFAULT\\s*\\(*([a-zA-Z0-9_']+(?:\\(\\))?)\\)*\\s+FOR\\s+([a-zA-Z0-9_]+)",
            "ALTER TABLE $1 ALTER COLUMN $3 SET DEFAULT $2"
        );

        // Normalize spaces
        sql = sql.replaceAll("\\s+", " ").trim();

        // Convert CREATE TABLE to CREATE TABLE IF NOT EXISTS
        sql = sql.replaceAll("(?is)\\bCREATE\\s+TABLE\\s+(?!IF\\s+NOT\\s+EXISTS\\b)", "CREATE TABLE IF NOT EXISTS ");

        // Convert CREATE INDEX to CREATE INDEX IF NOT EXISTS
        sql = sql.replaceAll("(?is)\\bCREATE\\s+(UNIQUE\\s+)?INDEX\\s+(?!IF\\s+NOT\\s+EXISTS\\b)", "CREATE $1INDEX IF NOT EXISTS ");

        // Convert DROP TABLE to DROP TABLE IF EXISTS
        sql = sql.replaceAll("(?is)\\bDROP\\s+TABLE\\s+(?!IF\\s+EXISTS\\b)", "DROP TABLE IF EXISTS ");

        // Convert DROP CONSTRAINT to DROP CONSTRAINT IF EXISTS
        sql = sql.replaceAll("(?is)\\bDROP\\s+CONSTRAINT\\s+(?!IF\\s+EXISTS\\b)", "DROP CONSTRAINT IF EXISTS ");

        return sql;
    }

    private void emulateV4_3(JdbcTemplate targetJdbcTemplate) {
        List<String> tables = targetJdbcTemplate.queryForList(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME NOT LIKE 'FLYWAY%' AND TABLE_NAME NOT LIKE 'ERP_%'",
            String.class
        );
        for (String table : tables) {
            List<String> columns = targetJdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                String.class,
                table
            );
            boolean hasCreatedAt = columns.stream().anyMatch(c -> c.equalsIgnoreCase("created_at"));
            boolean hasUpdatedAt = columns.stream().anyMatch(c -> c.equalsIgnoreCase("updated_at"));
            boolean hasCreatedBy = columns.stream().anyMatch(c -> c.equalsIgnoreCase("created_by"));
            boolean hasUpdatedBy = columns.stream().anyMatch(c -> c.equalsIgnoreCase("updated_by"));

            if (!hasCreatedAt) {
                String match = findColumnIgnoreCase(columns, "createdDate", "CREATED_DATE", "created_date");
                if (match != null) {
                    targetJdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN " + match + " TO created_at");
                }
            }
            if (!hasUpdatedAt) {
                String match = findColumnIgnoreCase(columns, "updatedDate", "UPDATED_DATE", "updated_date");
                if (match != null) {
                    targetJdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN " + match + " TO updated_at");
                }
            }
            if (!hasCreatedBy) {
                String match = findColumnIgnoreCase(columns, "createdBy", "CREATED_BY");
                if (match != null) {
                    targetJdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN " + match + " TO created_by");
                }
            }
            if (!hasUpdatedBy) {
                String match = findColumnIgnoreCase(columns, "updatedBy", "UPDATED_BY");
                if (match != null) {
                    targetJdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN " + match + " TO updated_by");
                }
            }
        }
    }

    private void emulateV4_4(JdbcTemplate targetJdbcTemplate) {
        List<String> tables = targetJdbcTemplate.queryForList(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME NOT LIKE 'FLYWAY%' AND TABLE_NAME NOT LIKE 'ERP_%'",
            String.class
        );
        for (String table : tables) {
            List<String> columns = targetJdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                String.class,
                table
            );
            for (String col : columns) {
                String lower = col.toLowerCase();
                if (!col.equals(lower)) {
                    try {
                        targetJdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN " + col + " TO " + lower);
                    } catch (Exception e) {
                        System.out.println("Could not rename column " + col + " to " + lower + " on " + table + ": " + e.getMessage());
                    }
                }
            }
        }
        renameTableIfExists(targetJdbcTemplate, "audit_criteria", "audit_criterion");
        renameTableIfExists(targetJdbcTemplate, "audit_types", "audit_type");
        renameTableIfExists(targetJdbcTemplate, "audit_areas", "audit_area");
        renameTableIfExists(targetJdbcTemplate, "audit_observations", "audit_observation");
        renameTableIfExists(targetJdbcTemplate, "audit_schedules", "audit_schedule");
    }

    private void emulateV6_0(JdbcTemplate targetJdbcTemplate) {
        targetJdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS MASTER_COUNTRY (
                id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                COUNTRY VARCHAR(100),
                STATUS VARCHAR(20) DEFAULT 'Active',
                created_by VARCHAR(100),
                created_at TIMESTAMP,
                updated_by VARCHAR(100),
                updated_at TIMESTAMP
            )
        """);
        Integer indiaCount = targetJdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM MASTER_COUNTRY WHERE COUNTRY = 'India'", Integer.class
        );
        if (indiaCount == null || indiaCount == 0) {
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('India', 'Active')");
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('USA', 'Active')");
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('Germany', 'Active')");
        }

        targetJdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS MASTER_STATE (
                id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                COUNTRY_NAME VARCHAR(100),
                STATE_NAME VARCHAR(100),
                STATE_CODE VARCHAR(20),
                STATUS VARCHAR(20) DEFAULT 'Active',
                created_by VARCHAR(100),
                created_at TIMESTAMP,
                updated_by VARCHAR(100),
                updated_at TIMESTAMP
            )
        """);

        List<String> targetTables = Arrays.asList(
            "ad_audit_trail", 
            "hrm_department_master", 
            "hrm_designation_master", 
            "hrm_employee_master", 
            "ad_user_credential",
            "sm_quotation_master",
            "sm_supplier_master"
        );
        for (String table : targetTables) {
            ensureAuditColumns(targetJdbcTemplate, table);
        }
    }

    private void emulateV8_1(JdbcTemplate targetJdbcTemplate) {
        targetJdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS MASTER_COUNTRY (
                id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                COUNTRY VARCHAR(100),
                STATUS VARCHAR(20) DEFAULT 'Active',
                created_by VARCHAR(100),
                created_at TIMESTAMP,
                updated_by VARCHAR(100),
                updated_at TIMESTAMP
            )
        """);
        Integer indiaCount = targetJdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM MASTER_COUNTRY WHERE COUNTRY = 'India'", Integer.class
        );
        if (indiaCount == null || indiaCount == 0) {
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('India', 'Active')");
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('USA', 'Active')");
            targetJdbcTemplate.execute("INSERT INTO MASTER_COUNTRY (COUNTRY, STATUS) VALUES ('Germany', 'Active')");
        }

        targetJdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS MASTER_STATE (
                id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                COUNTRY_NAME VARCHAR(100),
                STATE_NAME VARCHAR(100),
                STATE_CODE VARCHAR(20),
                STATUS VARCHAR(20) DEFAULT 'Active',
                created_by VARCHAR(100),
                created_at TIMESTAMP,
                updated_by VARCHAR(100),
                updated_at TIMESTAMP
            )
        """);

        List<String> targetTables = Arrays.asList(
            "ad_audit_trail", 
            "hrm_department_master", 
            "hrm_designation_master", 
            "hrm_employee_master", 
            "ad_user_credential",
            "sm_quotation",
            "sm_supplier_master"
        );
        for (String table : targetTables) {
            ensureAuditColumns(targetJdbcTemplate, table);
        }
    }

    private void emulateV8_6(JdbcTemplate targetJdbcTemplate) {
        List<String> targetTables = Arrays.asList(
            "MASTER_COUNTRY",
            "MASTER_STATE",
            "sm_currency",
            "sm_segment",
            "sm_sub_segment",
            "sm_type_of_service",
            "sm_payment_terms",
            "sm_delivery_terms",
            "sm_contact_master",
            "sm_price_master",
            "sm_subcontractor_master",
            "sm_customer_master"
        );
        for (String table : targetTables) {
            ensureAuditColumns(targetJdbcTemplate, table);
        }
    }

    private void emulateV14_0(JdbcTemplate targetJdbcTemplate) {
        ensureAuditColumns(targetJdbcTemplate, "sm_segment");
        ensureAuditColumns(targetJdbcTemplate, "sm_sub_segment");
    }

    private void emulateV14_0_2(JdbcTemplate targetJdbcTemplate) {
        ensureAuditColumns(targetJdbcTemplate, "sm_segment");
        ensureAuditColumns(targetJdbcTemplate, "sm_sub_segment");
    }

    private void ensureAuditColumns(JdbcTemplate targetJdbcTemplate, String tableName) {
        try {
            Integer count = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                Integer.class,
                tableName.toUpperCase()
            );
            if (count == null || count == 0) {
                return;
            }

            List<String> columns = targetJdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                String.class,
                tableName.toUpperCase()
            );

            if (columns.stream().noneMatch(c -> c.equalsIgnoreCase("created_by"))) {
                targetJdbcTemplate.execute("ALTER TABLE " + tableName + " ADD created_by VARCHAR(100)");
            }
            if (columns.stream().noneMatch(c -> c.equalsIgnoreCase("created_at"))) {
                targetJdbcTemplate.execute("ALTER TABLE " + tableName + " ADD created_at TIMESTAMP");
            }
            if (columns.stream().noneMatch(c -> c.equalsIgnoreCase("updated_by"))) {
                targetJdbcTemplate.execute("ALTER TABLE " + tableName + " ADD updated_by VARCHAR(100)");
            }
            if (columns.stream().noneMatch(c -> c.equalsIgnoreCase("updated_at"))) {
                targetJdbcTemplate.execute("ALTER TABLE " + tableName + " ADD updated_at TIMESTAMP");
            }
        } catch (Exception e) {
            System.out.println("Error ensuring audit columns for table " + tableName + ": " + e.getMessage());
        }
    }

    private void renameTableIfExists(JdbcTemplate targetJdbcTemplate, String oldTable, String newTable) {
        try {
            Integer countOld = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                Integer.class,
                oldTable.toUpperCase()
            );
            Integer countNew = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                Integer.class,
                newTable.toUpperCase()
            );
            if (countOld != null && countOld > 0 && (countNew == null || countNew == 0)) {
                targetJdbcTemplate.execute("ALTER TABLE " + oldTable + " RENAME TO " + newTable);
            }
        } catch (Exception e) {
            // Ignore
        }
    }

    private String findColumnIgnoreCase(List<String> columns, String... targets) {
        for (String target : targets) {
            for (String col : columns) {
                if (col.equalsIgnoreCase(target)) {
                    return col;
                }
            }
        }
        return null;
    }

    private void emulateV4_2(JdbcTemplate targetJdbcTemplate) {
        // Table Renames
        renameTableIfExists(targetJdbcTemplate, "AD_USER_CREDENTIALS", "ad_user_credential");
        renameTableIfExists(targetJdbcTemplate, "HRM_EMPLOYEE_MASTER", "hrm_employee_master");
        renameTableIfExists(targetJdbcTemplate, "EmployeeMaster", "hrm_employee_master");
        renameTableIfExists(targetJdbcTemplate, "DesignationMaster", "hrm_designation_master");
        renameTableIfExists(targetJdbcTemplate, "departments", "hrm_department_master");
        renameTableIfExists(targetJdbcTemplate, "hrm_desig_level", "hrm_designation_level");
        renameTableIfExists(targetJdbcTemplate, "audit_schedules", "audit_schedule");
        renameTableIfExists(targetJdbcTemplate, "audit_observations", "audit_observation");
        renameTableIfExists(targetJdbcTemplate, "audit_observation_details", "audit_observation_detail");
        renameTableIfExists(targetJdbcTemplate, "QMS_MASTER_CHECKLIST", "qms_checklist_master");

        // Column Renames
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "createdDate", "created_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "CREATED_DATE", "created_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "created_date", "created_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "updatedDate", "updated_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "UPDATED_DATE", "updated_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "updated_date", "updated_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "OBSERVATION_NO", "observation_no");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation", "AUDIT_TYPE", "audit_type");

        renameColumnIfExists(targetJdbcTemplate, "audit_schedule", "createdDate", "created_at");
        renameColumnIfExists(targetJdbcTemplate, "audit_schedule", "updatedDate", "updated_at");

        renameColumnIfExists(targetJdbcTemplate, "hrm_employee_master", "createdDate", "created_at");
        renameColumnIfExists(targetJdbcTemplate, "hrm_employee_master", "updatedDate", "updated_at");

        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "observationId", "observation_id");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "OBSERVATIONID", "observation_id");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "OBSERVATION_ID", "observation_id");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "ncrNo", "ncr_no");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "NCRNO", "ncr_no");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "seqNo", "seq_no");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "SEQNO", "seq_no");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "criteriaDetails", "criteria_details");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "CRITERIADETAILS", "criteria_details");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "attachmentReq", "attachment_req");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "ATTACHMENTREQ", "attachment_req");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "observationStatus", "observation_status");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "OBSERVATIONSTATUS", "observation_status");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "approvalStatus", "approval_status");
        renameColumnIfExists(targetJdbcTemplate, "audit_observation_detail", "APPROVALSTATUS", "approval_status");

        renameColumnIfExists(targetJdbcTemplate, "ad_user_credential", "USER_ID", "user_id");
        renameColumnIfExists(targetJdbcTemplate, "ad_user_credential", "CREATED_DATE", "created_at");

        ensureObservationDetailColumns(targetJdbcTemplate);
    }

    private void ensureObservationDetailColumns(JdbcTemplate targetJdbcTemplate) {
        String table = "audit_observation_detail";
        try {
            Integer tableCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                Integer.class,
                table.toUpperCase()
            );
            if (tableCount == null || tableCount == 0) {
                return;
            }
            List<String> columns = targetJdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                String.class,
                table.toUpperCase()
            );

            addColIfMissing(targetJdbcTemplate, table, columns, "observation_id", "BIGINT");
            addColIfMissing(targetJdbcTemplate, table, columns, "seq_no", "VARCHAR(50)");
            addColIfMissing(targetJdbcTemplate, table, columns, "criteria_details", "CLOB");
            addColIfMissing(targetJdbcTemplate, table, columns, "attachment_req", "VARCHAR(20)");
            addColIfMissing(targetJdbcTemplate, table, columns, "attachment_path", "CLOB");
            addColIfMissing(targetJdbcTemplate, table, columns, "observation_status", "VARCHAR(50)");
            addColIfMissing(targetJdbcTemplate, table, columns, "approval_status", "VARCHAR(50)");
            addColIfMissing(targetJdbcTemplate, table, columns, "root_cause", "CLOB");
            addColIfMissing(targetJdbcTemplate, table, columns, "corrective_action", "CLOB");
            addColIfMissing(targetJdbcTemplate, table, columns, "preventive_action", "CLOB");
            addColIfMissing(targetJdbcTemplate, table, columns, "target_date", "DATE");
            addColIfMissing(targetJdbcTemplate, table, columns, "closed_date", "DATE");
            addColIfMissing(targetJdbcTemplate, table, columns, "closed_by", "VARCHAR(255)");
            addColIfMissing(targetJdbcTemplate, table, columns, "ncr_status", "VARCHAR(50)");
            addColIfMissing(targetJdbcTemplate, table, columns, "ncr_no", "VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("Error ensuring columns for table audit_observation_detail: " + e.getMessage());
        }
    }

    private void addColIfMissing(JdbcTemplate targetJdbcTemplate, String table, List<String> columns, String colName, String type) {
        if (columns.stream().noneMatch(c -> c.equalsIgnoreCase(colName))) {
            try {
                targetJdbcTemplate.execute("ALTER TABLE " + table + " ADD " + colName + " " + type);
            } catch (Exception e) {
                System.out.println("Could not add column " + colName + " to " + table + ": " + e.getMessage());
            }
        }
    }

    private void emulateV13_1(JdbcTemplate targetJdbcTemplate) {
        try {
            // 1. Seed default company if none exist
            Integer compCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ad_company_credential WHERE id = 1", Integer.class
            );
            if (compCount == null || compCount == 0) {
                targetJdbcTemplate.execute("""
                    INSERT INTO ad_company_credential (
                        id, company_name, short_name, address, city, state, country, pincode, gst_in, db_source_name, lic_expiry_date, lic_exp_remainder_days
                    ) VALUES (
                        1, 'Autonoma ERP Corp', 'Autonoma', '123 Main Street', 'Chennai', 'Tamil Nadu', 'India', '600001', '33AABCT1234A1Z1', 'AUTONOMA', DATEADD('year', 1, CURRENT_DATE), 30
                    )
                """);
            }

            // 2. Seed default division if none exist for company_id = 1
            Integer divCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ad_division_master WHERE company_id = 1", Integer.class
            );
            if (divCount == null || divCount == 0) {
                targetJdbcTemplate.execute("""
                    INSERT INTO ad_division_master (
                        company_id, division_name, description, address, city, state, country, pincode, gst_in, status
                    ) VALUES (
                        1, 'Main Division', 'Primary business division', '123 Main Street', 'Chennai', 'Tamil Nadu', 'India', '600001', '33AABCT1234A1Z1', 1
                    )
                """);
            }

            // 3. Seed default company mapping for Admin if none exist
            Integer mapCompCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM AD_USER_COMPANY_MAPPING WHERE user_id = 'Admin'", Integer.class
            );
            if (mapCompCount == null || mapCompCount == 0) {
                targetJdbcTemplate.execute("""
                    INSERT INTO AD_USER_COMPANY_MAPPING (
                        user_id, company_id, created_by
                    ) VALUES (
                        'Admin', 1, 'SYSTEM'
                    )
                """);
            }

            // 4. Seed default division mapping for Admin if none exist
            Integer mapDivCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM AD_USER_DIVISION_MAPPING WHERE user_id = 'Admin'", Integer.class
            );
            if (mapDivCount == null || mapDivCount == 0) {
                targetJdbcTemplate.execute("""
                    INSERT INTO AD_USER_DIVISION_MAPPING (
                        user_id, division_id, created_by
                    )
                    SELECT 'Admin', id, 'SYSTEM'
                    FROM ad_division_master
                    WHERE company_id = 1
                      AND NOT EXISTS (SELECT 1 FROM AD_USER_DIVISION_MAPPING WHERE user_id = 'Admin')
                """);
            }
        } catch (Exception e) {
            System.out.println("Error in emulateV13_1: " + e.getMessage());
        }
    }

    private void emulateV10_0(JdbcTemplate targetJdbcTemplate) {
        try {
            targetJdbcTemplate.execute("ALTER TABLE hrm_department_master ALTER COLUMN dept_no VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("Could not alter hrm_department_master.dept_no: " + e.getMessage());
        }
    }

    private void renameColumnIfExists(JdbcTemplate targetJdbcTemplate, String tableName, String oldCol, String newCol) {
        try {
            Integer tableCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ?",
                Integer.class,
                tableName.toUpperCase()
            );
            if (tableCount == null || tableCount == 0) {
                return;
            }
            Integer oldColCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName.toUpperCase(),
                oldCol.toUpperCase()
            );
            Integer newColCount = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'PUBLIC' AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName.toUpperCase(),
                newCol.toUpperCase()
            );
            if (oldColCount != null && oldColCount > 0 && (newColCount == null || newColCount == 0)) {
                targetJdbcTemplate.execute("ALTER TABLE " + tableName + " RENAME COLUMN " + oldCol + " TO " + newCol);
            }
        } catch (Exception e) {
            // Ignore
        }
    }

    private List<String> splitSqlBySemicolon(String sql) {
        List<String> result = new java.util.ArrayList<>();
        StringBuilder currentBatch = new StringBuilder();
        boolean inSingleQuote = false;
        boolean inDoubleQuote = false;
        
        for (int i = 0; i < sql.length(); i++) {
            char c = sql.charAt(i);
            
            if (c == '\'' && (i == 0 || sql.charAt(i - 1) != '\\')) {
                inSingleQuote = !inSingleQuote;
            } else if (c == '"' && (i == 0 || sql.charAt(i - 1) != '\\')) {
                inDoubleQuote = !inDoubleQuote;
            }
            
            if (c == ';' && !inSingleQuote && !inDoubleQuote) {
                result.add(currentBatch.toString());
                currentBatch = new StringBuilder();
            } else {
                currentBatch.append(c);
            }
        }
        
        if (currentBatch.length() > 0) {
            result.add(currentBatch.toString());
        }
        
        return result;
    }
}