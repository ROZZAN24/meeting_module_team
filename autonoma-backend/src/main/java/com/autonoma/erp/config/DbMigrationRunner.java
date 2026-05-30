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
import java.util.List;
import java.util.stream.Collectors;

@Component
@Order(2)
public class DbMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        boolean isH2 = false;
        try {
            String url = jdbcTemplate.getDataSource().getConnection().getMetaData().getURL();
            if (url != null && url.contains(":h2:")) {
                isH2 = true;
            }
        } catch (Exception e) {
            // Default to false
        }
        if (isH2) {
            System.out.println("H2 DATABASE DETECTED: SKIPPING NEW DUAL MIGRATION RUNNER");
            return;
        }
        runMigrations(this.jdbcTemplate);
    }

    public void runMigrations(JdbcTemplate targetJdbcTemplate) throws Exception {
        System.out.println("======================================");
        System.out.println("NEW DUAL MIGRATION RUNNER: SCANNED FOR PATH");
        System.out.println("======================================");

        createMigrationTables(targetJdbcTemplate);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = new Resource[0];
        try {
            resources = resolver.getResources("classpath:db/migration/**/*.sql");
        } catch (Exception e) {
            System.err.println("Failed to load modular migration scripts: " + e.getMessage());
        }

        List<Resource> sortedResources = Arrays.stream(resources)
                .sorted((r1, r2) -> {
                    String f1 = r1.getFilename();
                    String f2 = r2.getFilename();
                    if (f1 == null || f2 == null) return 0;
                    return f1.compareToIgnoreCase(f2);
                })
                .collect(Collectors.toList());

        for (Resource resource : sortedResources) {
            String fileName = resource.getFilename();
            try {
                if (isAlreadyExecuted(targetJdbcTemplate, fileName)) {
                    System.out.println("ALREADY EXECUTED (NEW PATH) : " + fileName);
                    continue;
                }

                System.out.println("EXECUTING MIGRATION (NEW PATH) : " + fileName);

                String sql = readSqlFile(resource);
                sql = removeUseStatements(sql);

                List<String> batches = Arrays.asList(sql.split("(?im)^\\s*GO\\s*$"));
                
                targetJdbcTemplate.execute((java.sql.Connection con) -> {
                    try (java.sql.Statement stmt = con.createStatement()) {
                        for (String batch : batches) {
                            if (batch == null || batch.trim().isEmpty()) {
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

                markAsExecuted(targetJdbcTemplate, fileName);
                System.out.println("COMPLETED MIGRATION (NEW PATH) : " + fileName);

            } catch (Exception e) {
                System.err.println("##############################################################################");
                System.err.println("#                      DATABASE MIGRATION FILE FAILED                        #");
                System.err.println("##############################################################################");
                System.err.println("# FILE: " + fileName);
                System.err.println("# ERROR: " + e.getMessage());
                System.err.println("##############################################################################");
                throw new RuntimeException("Database migration failed on script: " + fileName + ". Reason: " + e.getMessage(), e);
            }
        }

        System.out.println("======================================");
        System.out.println("NEW DUAL MIGRATION RUNNER: COMPLETED");
        System.out.println("======================================");
    }

    private void createMigrationTables(JdbcTemplate targetJdbcTemplate) {
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

    private boolean isAlreadyExecuted(JdbcTemplate targetJdbcTemplate, String fileName) {
        Integer count = targetJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ERP_EXECUTED_SCRIPTS WHERE SCRIPT_NAME = ?",
                Integer.class,
                fileName);
        return count != null && count > 0;
    }

    private void markAsExecuted(JdbcTemplate targetJdbcTemplate, String fileName) {
        targetJdbcTemplate.update(
                "INSERT INTO ERP_EXECUTED_SCRIPTS (SCRIPT_NAME) VALUES (?)",
                fileName);
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
}
