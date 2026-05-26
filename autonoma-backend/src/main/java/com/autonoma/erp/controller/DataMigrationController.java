package com.autonoma.erp.controller;

import com.autonoma.erp.model.admin.MigrationAuditLog;
import com.autonoma.erp.repository.admin.MigrationAuditLogRepository;
import com.autonoma.erp.service.MasterChecklistMigrationService;
import com.autonoma.erp.util.SecurityUtils;
import com.autonoma.erp.repository.admin.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin/migration")
public class DataMigrationController {

    @Autowired
    private MasterChecklistMigrationService migrationService;

    @Autowired
    private MigrationAuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── Resolve current user safely ────────────────────────────────────────────
    private String resolveCurrentUser() {
        String currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser != null && !userRepository.existsById(currentUser)) {
            return null;
        }
        return currentUser;
    }

    // ─── Extract record count from result message ────────────────────────────────
    private int extractCount(String result) {
        Pattern pattern = Pattern.compile("Successfully migrated (\\d+)");
        Matcher matcher = pattern.matcher(result);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
    }

    // ─── POST /api/admin/migration/checklists ────────────────────────────────────
    @PostMapping("/checklists")
    public ResponseEntity<Map<String, String>> migrateChecklists() {
        Map<String, String> response = new HashMap<>();
        String currentUser = resolveCurrentUser();

        MigrationAuditLog auditLog = MigrationAuditLog.builder()
                .tableName("HRMS_MASTER_CHECKLIST -> qms_checklist_master")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();

        try {
            String result = migrationService.migrateOldChecklists();
            response.put("message", result);

            auditLog.setStatus("SUCCESS");
            auditLog.setRecordsCount(extractCount(result));
            auditLog.setMessage(result);
            auditLogRepository.save(auditLog);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String errorMsg = "Migration failed: " + e.getMessage();
            response.put("message", errorMsg);

            auditLog.setStatus("FAILED");
            auditLog.setRecordsCount(0);
            auditLog.setMessage(e.getMessage());
            auditLogRepository.save(auditLog);

            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ─── POST /api/admin/migration/departments ──────────────────────────────────
    @PostMapping("/departments")
    public ResponseEntity<Map<String, String>> migrateDepartments() {
        Map<String, String> response = new HashMap<>();
        String currentUser = resolveCurrentUser();

        MigrationAuditLog auditLog = MigrationAuditLog.builder()
                .tableName("DEPT -> hrm_department_master")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();

        try {
            String result = migrationService.migrateDepartments();
            response.put("message", result);

            auditLog.setStatus("SUCCESS");
            auditLog.setRecordsCount(extractCount(result));
            auditLog.setMessage(result);
            auditLogRepository.save(auditLog);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String errorMsg = "Department migration failed: " + e.getMessage();
            response.put("message", errorMsg);

            auditLog.setStatus("FAILED");
            auditLog.setRecordsCount(0);
            auditLog.setMessage(e.getMessage());
            auditLogRepository.save(auditLog);

            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ─── POST /api/admin/migration/assignments ───────────────────────────────────
    @PostMapping("/assignments")
    public ResponseEntity<Map<String, String>> migrateAssignments() {
        Map<String, String> response = new HashMap<>();
        String currentUser = resolveCurrentUser();

        MigrationAuditLog auditLog = MigrationAuditLog.builder()
                .tableName("QMS_ASSIGN_CHECKLIST -> qms_checklist_assignment")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();

        try {
            String result = migrationService.migrateChecklistAssignments();
            response.put("message", result);

            auditLog.setStatus("SUCCESS");
            auditLog.setRecordsCount(extractCount(result));
            auditLog.setMessage(result);
            auditLogRepository.save(auditLog);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String errorMsg = "Assignment migration failed: " + e.getMessage();
            response.put("message", errorMsg);

            auditLog.setStatus("FAILED");
            auditLog.setRecordsCount(0);
            auditLog.setMessage(e.getMessage());
            auditLogRepository.save(auditLog);

            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ─── POST /api/admin/migration/checklists-and-assignments ────────────────────
    @PostMapping("/checklists-and-assignments")
    public ResponseEntity<Map<String, String>> migrateChecklistsAndAssignments() {
        Map<String, String> response = new HashMap<>();
        String currentUser = resolveCurrentUser();
        StringBuilder summary = new StringBuilder();
        boolean anyFailed = false;

        // Part 1: Master Checklists
        MigrationAuditLog masterLog = MigrationAuditLog.builder()
                .tableName("HRMS_MASTER_CHECKLIST -> qms_checklist_master")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();
        try {
            String result = migrationService.migrateOldChecklists();
            masterLog.setStatus("SUCCESS");
            masterLog.setRecordsCount(extractCount(result));
            masterLog.setMessage(result);
            summary.append("[Master] ").append(result).append(" | ");
        } catch (Exception e) {
            anyFailed = true;
            masterLog.setStatus("FAILED");
            masterLog.setRecordsCount(0);
            masterLog.setMessage(e.getMessage());
            summary.append("[Master] FAILED: ").append(e.getMessage()).append(" | ");
        } finally {
            auditLogRepository.save(masterLog);
        }

        // Part 2: Checklist Assignments
        MigrationAuditLog assignLog = MigrationAuditLog.builder()
                .tableName("QMS_ASSIGN_CHECKLIST -> qms_checklist_assignment")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();
        try {
            String result = migrationService.migrateChecklistAssignments();
            assignLog.setStatus("SUCCESS");
            assignLog.setRecordsCount(extractCount(result));
            assignLog.setMessage(result);
            summary.append("[Assignments] ").append(result);
        } catch (Exception e) {
            anyFailed = true;
            assignLog.setStatus("FAILED");
            assignLog.setRecordsCount(0);
            assignLog.setMessage(e.getMessage());
            summary.append("[Assignments] FAILED: ").append(e.getMessage());
        } finally {
            auditLogRepository.save(assignLog);
        }

        response.put("message", summary.toString());
        return anyFailed
                ? ResponseEntity.internalServerError().body(response)
                : ResponseEntity.ok(response);
    }

    // ─── POST /api/admin/migration/all ───────────────────────────────────────────
    @PostMapping("/all")
    public ResponseEntity<Map<String, String>> migrateAll() {
        Map<String, String> response = new HashMap<>();
        String currentUser = resolveCurrentUser();
        StringBuilder summary = new StringBuilder();
        boolean anyFailed = false;

        // Step 1: Departments
        MigrationAuditLog deptLog = MigrationAuditLog.builder()
                .tableName("DEPT -> hrm_department_master")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();
        try {
            String result = migrationService.migrateDepartments();
            deptLog.setStatus("SUCCESS");
            deptLog.setRecordsCount(extractCount(result));
            deptLog.setMessage(result);
            summary.append("[Departments] ").append(result).append(" | ");
        } catch (Exception e) {
            anyFailed = true;
            deptLog.setStatus("FAILED");
            deptLog.setRecordsCount(0);
            deptLog.setMessage(e.getMessage());
            summary.append("[Departments] FAILED: ").append(e.getMessage()).append(" | ");
        } finally {
            auditLogRepository.save(deptLog);
        }

        // Step 2: Master Checklists
        MigrationAuditLog masterLog = MigrationAuditLog.builder()
                .tableName("HRMS_MASTER_CHECKLIST -> qms_checklist_master")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();
        try {
            String result = migrationService.migrateOldChecklists();
            masterLog.setStatus("SUCCESS");
            masterLog.setRecordsCount(extractCount(result));
            masterLog.setMessage(result);
            summary.append("[Master] ").append(result).append(" | ");
        } catch (Exception e) {
            anyFailed = true;
            masterLog.setStatus("FAILED");
            masterLog.setRecordsCount(0);
            masterLog.setMessage(e.getMessage());
            summary.append("[Master] FAILED: ").append(e.getMessage()).append(" | ");
        } finally {
            auditLogRepository.save(masterLog);
        }

        // Step 3: Checklist Assignments
        MigrationAuditLog assignLog = MigrationAuditLog.builder()
                .tableName("QMS_ASSIGN_CHECKLIST -> qms_checklist_assignment")
                .migratedBy(currentUser)
                .migratedAt(new Date())
                .build();
        try {
            String result = migrationService.migrateChecklistAssignments();
            assignLog.setStatus("SUCCESS");
            assignLog.setRecordsCount(extractCount(result));
            assignLog.setMessage(result);
            summary.append("[Assignments] ").append(result);
        } catch (Exception e) {
            anyFailed = true;
            assignLog.setStatus("FAILED");
            assignLog.setRecordsCount(0);
            assignLog.setMessage(e.getMessage());
            summary.append("[Assignments] FAILED: ").append(e.getMessage());
        } finally {
            auditLogRepository.save(assignLog);
        }

        response.put("message", summary.toString());
        return anyFailed
                ? ResponseEntity.internalServerError().body(response)
                : ResponseEntity.ok(response);
    }

    // ─── GET /api/admin/migration/audit-logs ─────────────────────────────────────
    @GetMapping("/audit-logs")
    public ResponseEntity<List<MigrationAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByMigratedAtDesc());
    }
}
