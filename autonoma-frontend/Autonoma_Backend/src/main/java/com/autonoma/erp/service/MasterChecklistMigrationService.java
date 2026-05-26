package com.autonoma.erp.service;

import com.autonoma.erp.model.ChecklistAssignment;
import com.autonoma.erp.model.ChecklistDepartment;
import com.autonoma.erp.model.MasterChecklist;
import com.autonoma.erp.repository.ChecklistAssignmentRepository;
import com.autonoma.erp.repository.MasterChecklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MasterChecklistMigrationService {

    @Autowired
    @Qualifier("secondaryJdbcTemplate")
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MasterChecklistRepository masterChecklistRepository;

    @Autowired
    private ChecklistAssignmentRepository checklistAssignmentRepository;

    @Autowired
    private com.autonoma.erp.repository.DepartmentRepository departmentRepository;

    // ─── STATUS int mapping ─────────────────────────────────────────────────────
    // STATUS: 0=INACTIVE/DRAFT, 1=ACTIVE, 2=EXPIRED, 3=PENDING, 4=CANCELLED
    // TASK_STATUS: 0=PENDING, 1=IN_PROGRESS, 2=COMPLETED, 3=OVERDUE, 4=CANCELLED
    // VERIFY_STATUS: 0=PENDING, 1=APPROVED, 2=REJECTED, 3=HOLD
    // ASSIGN STATUS: 0=INACTIVE, 1=ACTIVE
    // ────────────────────────────────────────────────────────────────────────────

    // ─── MASTER CHECKLIST MIGRATION ─────────────────────────────────────────────

    @Transactional
    public String migrateOldChecklists() {
        String sql = "SELECT * FROM HRMS_MASTER_CHECKLIST";

        List<MasterChecklist> migratedList = jdbcTemplate.query(sql, (rs, rowNum) -> {
            MasterChecklist checklist = new MasterChecklist();

            // Store legacy row_id as seqNo for cross-reference (used by assignment
            // migration)
            int legacyRowId = rs.getInt("row_id");
            checklist.setSeqNo(String.valueOf(legacyRowId));

            // Map simple string fields
            checklist.setCheckingPoint(rs.getString("CHECKING_POINT"));
            checklist.setStockLink(rs.getString("STOCK_LINK"));
            checklist.setDescription(rs.getString("COMMENTS"));
            checklist.setCategory(rs.getString("CUST_CATEGORY"));
            checklist.setPhotoRequired(rs.getString("PHOTO_REQUIRED"));
            checklist.setVerificationRequired(rs.getString("VERIFICATION_REQUIRED"));
            checklist.setFrequency(rs.getString("FREQUENCY_LEVEL"));
            checklist.setAssignTo(rs.getString("ASSIGN_TO"));
            checklist.setCarryForward(rs.getString("CARRY_FORWARD"));
            checklist.setRejReason(rs.getString("REJECT_REASON"));
            checklist.setAmendmentReason(rs.getString("AMENDMENT_REASON"));

            // Map status fields as INT (converted from legacy string values)
            checklist.setStatus(rs.getString("STATUS"));
            checklist.setTaskStatus(rs.getString("TASK_STATUS"));
            checklist.setVerifyStatus(rs.getString("APPROVAL_STATUS"));

            // Map user and audit fields
            checklist.setCreatedBy(rs.getString("CREAT_USER_ID_CD"));
            checklist.setCreatedAt(rs.getTimestamp("CREAT_DT"));
            checklist.setUpdatedBy(rs.getString("LST_UPDT_USER_ID_CD"));
            checklist.setUpdatedAt(rs.getTimestamp("LST_UPDT_TS"));

            checklist.setVerifiedBy(rs.getString("APPROVED_BY"));
            checklist.setVerifiedDate(rs.getTimestamp("APPROVED_DATE"));

            // Map dates
            checklist.setEffectiveFrom(rs.getDate("START_DATE"));
            checklist.setExpiryDate(rs.getDate("RENEWAL_EXPIRY_DATE"));
            checklist.setReminderDate(rs.getDate("REMINDER_DATE"));

            // Map primitives
            checklist.setReminderDays(rs.getInt("REMINDER_DAYS"));

            // Handle level list
            checklist.setLevelIds(rs.getString("LEVEL"));

            // Handle Departments mapping
            String deptNo = rs.getString("DEPT_NO");
            if (deptNo != null && !deptNo.trim().isEmpty()) {
                List<ChecklistDepartment> deptList = new ArrayList<>();
                for (String dept : deptNo.split(",")) {
                    String cleanDept = dept.trim();
                    if (!cleanDept.isEmpty()) {
                        ChecklistDepartment checklistDept = new ChecklistDepartment();
                        com.autonoma.erp.model.Department resolvedDept = departmentRepository
                                .findByDepartmentNo(cleanDept).orElse(null);
                        if (resolvedDept != null) {
                            checklistDept.setDepartment(resolvedDept);
                            checklistDept.setChecklist(checklist);
                            deptList.add(checklistDept);
                        }
                    }
                }
                checklist.setDepartments(deptList);
            }

            return checklist;
        });

        if (!migratedList.isEmpty()) {
            masterChecklistRepository.saveAll(migratedList);
        }

        return "Successfully migrated " + migratedList.size()
                + " checklist records from HRMS_MASTER_CHECKLIST to qms_checklist_master.";
    }

    // ─── CHECKLIST ASSIGNMENT MIGRATION ─────────────────────────────────────────

    @Transactional
    public String migrateChecklistAssignments() {
        // Build a lookup: legacy row_id (SEQ_NO) -> new MasterChecklist entity
        List<MasterChecklist> allChecklists = masterChecklistRepository.findAll();
        Map<String, MasterChecklist> checklistByLegacyId = allChecklists.stream()
                .filter(c -> c.getSeqNo() != null && !c.getSeqNo().trim().isEmpty())
                .collect(Collectors.toMap(
                        MasterChecklist::getSeqNo,
                        c -> c,
                        (a, b) -> a // keep first on duplicate seqNo
                ));

        if (checklistByLegacyId.isEmpty()) {
            return "No migrated checklists found with legacy row IDs. Please run master checklist migration first.";
        }

        // Read all assignment records from the secondary (legacy) DB
        String sql = "SELECT * FROM QMS_ASSIGN_CHECKLIST";
        List<ChecklistAssignment> assignments = jdbcTemplate.query(sql, (rs, rowNum) -> {
            String legacyCheckId = String.valueOf(rs.getInt("check_row_id"));
            MasterChecklist parentChecklist = checklistByLegacyId.get(legacyCheckId);

            // Skip if no matching checklist found in main DB
            if (parentChecklist == null)
                return null;

            ChecklistAssignment assignment = new ChecklistAssignment();
            assignment.setChecklist(parentChecklist);

            // emp_code is the assigned employee (stored as string ID)
            int empCode = rs.getInt("emp_code");
            assignment.setAssignedTo(empCode > 0 ? String.valueOf(empCode) : null);

            // creat_user_id_cd is who assigned
            assignment.setAssignedBy(rs.getString("creat_user_id_cd"));
            assignment.setAssignedDate(rs.getTimestamp("creat_dt"));

            // reassign_empcd - if reassigned, record as updatedBy
            int reassignEmpCode = rs.getInt("reassign_empcd");
            assignment.setUpdatedBy(
                    reassignEmpCode > 0 ? String.valueOf(reassignEmpCode) : rs.getString("lst_updt_user_id_cd"));
            assignment.setUpdatedAt(rs.getTimestamp("lst_updt_ts"));

            // assign_type
            assignment.setAssignType(rs.getString("assign_type"));

            // Carry forward count from most frequent email tracking
            int weekCount = rs.getInt("week_count");
            int monthCount = rs.getInt("month_count");
            int customCount = rs.getInt("custom_count");
            int quarterCount = rs.getInt("quarterly_count");
            int annualCount = rs.getInt("annual_count");
            int maxCount = Math.max(weekCount, Math.max(monthCount,
                    Math.max(customCount, Math.max(quarterCount, annualCount))));
            assignment.setCarryForwardCount(maxCount);

            // No status_id mapping — leave null (no StatusMaster lookup during batch
            // migration)
            assignment.setStatus(null);

            return assignment;
        });

        // Filter out nulls (unmatched checklist references)
        List<ChecklistAssignment> validAssignments = assignments.stream()
                .filter(a -> a != null)
                .collect(Collectors.toList());

        if (!validAssignments.isEmpty()) {
            checklistAssignmentRepository.saveAll(validAssignments);
        }

        int skipped = assignments.size() - validAssignments.size();
        return "Successfully migrated " + validAssignments.size()
                + " assignment records from QMS_ASSIGN_CHECKLIST to qms_checklist_assignment."
                + (skipped > 0 ? " (Skipped " + skipped + " records with no matching checklist.)" : "");
    }
}
