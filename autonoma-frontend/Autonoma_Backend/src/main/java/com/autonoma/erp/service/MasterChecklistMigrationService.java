package com.autonoma.erp.service;

import com.autonoma.erp.model.ChecklistAssignment;
import com.autonoma.erp.model.ChecklistDepartment;
import com.autonoma.erp.model.MasterChecklist;
import com.autonoma.erp.model.StatusMaster;
import com.autonoma.erp.model.ChecklistVerification;
import com.autonoma.erp.repository.ChecklistAssignmentRepository;
import com.autonoma.erp.repository.MasterChecklistRepository;
import com.autonoma.erp.repository.StatusMasterRepository;
import com.autonoma.erp.repository.ChecklistVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MasterChecklistMigrationService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    @Qualifier("secondaryJdbcTemplate")
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MasterChecklistRepository masterChecklistRepository;

    @Autowired
    private ChecklistAssignmentRepository checklistAssignmentRepository;

    @Autowired
    private com.autonoma.erp.repository.DepartmentRepository departmentRepository;

    @Autowired
    private StatusMasterRepository statusRepo;

    @Autowired
    private ChecklistVerificationRepository checklistVerificationRepository;

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

        // Fetch all statuses to map status text to StatusMaster entity
        List<StatusMaster> allStatuses = statusRepo.findAll();
        Map<String, StatusMaster> statusMap = allStatuses.stream()
                .collect(Collectors.toMap(
                        s -> s.getName().toUpperCase(),
                        s -> s,
                        (a, b) -> a
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

            // Map status using statusMap
            String legacyStatus = rs.getString("status");
            if (legacyStatus != null) {
                String lookupName = "ACTIVE".equalsIgnoreCase(legacyStatus) ? "Pending" : "Not Completed";
                StatusMaster resolvedStatus = statusMap.get(lookupName.toUpperCase());
                assignment.setStatus(resolvedStatus);
            }

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

    // ─── CLOSE CHECKLIST MIGRATION (HRMS_CHECKLIST_PENDING_MASTER) ───────────────
    @Transactional
    public String migrateCloseChecklists() {
        if (jdbcTemplate == null) {
            return "Migration database not configured in application.properties.";
        }
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
            return "No migrated checklists found. Please run checklists migration first.";
        }

        // Fetch all statuses to map status text to StatusMaster entity
        List<StatusMaster> allStatuses = statusRepo.findAll();
        Map<String, StatusMaster> statusMap = allStatuses.stream()
                .collect(Collectors.toMap(
                        s -> s.getName().toUpperCase(),
                        s -> s,
                        (a, b) -> a
                ));

        int totalMigrated = 0;
        int totalSkipped = 0;
        int batchSize = 1000;
        int offset = 0;
        boolean hasMore = true;

        // Local helper class to capture intermediate variables mapping legacy rows
        class TempPendingMaster {
            int legacyRowId;
            ChecklistAssignment assignment;
            String verificationStatus;
            java.sql.Timestamp verificationDate;
            String rejectionComments;
            String lstUpdateUserIdCd;
        }

        while (hasMore) {
            String sql = "SELECT * FROM HRMS_CHECKLIST_PENDING_MASTER ORDER BY ROW_ID OFFSET " + offset + " ROWS FETCH NEXT " + batchSize + " ROWS ONLY";
            
            List<TempPendingMaster> batchTemps = jdbcTemplate.query(sql, (rs, rowNum) -> {
                String legacyCheckId = String.valueOf(rs.getInt("CHECK_ROW_ID"));
                MasterChecklist parentChecklist = checklistByLegacyId.get(legacyCheckId);

                if (parentChecklist == null) {
                    return null;
                }

                ChecklistAssignment assignment = new ChecklistAssignment();
                assignment.setChecklist(parentChecklist);

                int empCd = rs.getInt("EMP_CODE");
                assignment.setAssignedTo(empCd > 0 ? String.valueOf(empCd) : null);

                int assignedBy = rs.getInt("ASSIGNED_BY");
                assignment.setAssignedBy(assignedBy > 0 ? String.valueOf(assignedBy) : rs.getString("CREAT_USER_ID_CD"));
                assignment.setAssignedDate(rs.getTimestamp("CREAT_DT"));

                assignment.setRemarks(rs.getString("COMMENTS"));
                assignment.setChecklistDate(rs.getDate("CHECKLIST_DATE"));
                assignment.setCarryForwardCount(rs.getInt("CARRY_FORWARD_COUNT"));

                assignment.setUpdatedBy(rs.getString("LST_UPDT_USER_ID_CD"));
                assignment.setUpdatedAt(rs.getTimestamp("LST_UPDT_TS"));

                // Map status
                String legacyStatus = rs.getString("STATUS");
                if (legacyStatus != null) {
                    StatusMaster resolvedStatus = statusMap.get(legacyStatus.toUpperCase());
                    assignment.setStatus(resolvedStatus);
                }

                TempPendingMaster temp = new TempPendingMaster();
                temp.legacyRowId = rs.getInt("ROW_ID");
                temp.assignment = assignment;
                temp.verificationStatus = rs.getString("VERIFICATION_STATUS");
                temp.verificationDate = rs.getTimestamp("VERIFICATION_DATE");
                temp.rejectionComments = rs.getString("REJECTION_COMMENTS");
                temp.lstUpdateUserIdCd = rs.getString("LST_UPDT_USER_ID_CD");
                return temp;
            });

            // Filter out nulls
            List<TempPendingMaster> validTemps = batchTemps.stream()
                    .filter(t -> t != null)
                    .collect(Collectors.toList());

            if (validTemps.isEmpty()) {
                if (batchTemps.isEmpty()) {
                    hasMore = false;
                } else {
                    totalSkipped += batchTemps.size();
                    offset += batchSize;
                }
                continue;
            }

            // Map files for this batch in a single query
            List<Integer> legacyRowIds = validTemps.stream()
                    .map(t -> t.legacyRowId)
                    .collect(Collectors.toList());

            String idsString = legacyRowIds.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));

            Map<Integer, List<String>> filesByLegacyRowId = new java.util.HashMap<>();
            if (!idsString.isEmpty()) {
                String fileSql = "SELECT ref_row_id, file_name FROM FILE_UPLOAD_TRANS WHERE from_where = 'CLOSE CHECKLIST' AND ref_row_id IN (" + idsString + ")";
                jdbcTemplate.query(fileSql, (rsFile) -> {
                    int refRowId = rsFile.getInt("ref_row_id");
                    String fileName = rsFile.getString("file_name");
                    if (fileName != null && !fileName.trim().isEmpty()) {
                        filesByLegacyRowId.computeIfAbsent(refRowId, k -> new ArrayList<>()).add(fileName.trim());
                    }
                });
            }

            // Set files on assignments
            for (TempPendingMaster temp : validTemps) {
                List<String> files = filesByLegacyRowId.get(temp.legacyRowId);
                if (files != null) {
                    temp.assignment.setActualFiles(files);
                }
            }

            // Save assignments in batch
            List<ChecklistAssignment> assignmentsToSave = validTemps.stream()
                    .map(t -> t.assignment)
                    .collect(Collectors.toList());
            checklistAssignmentRepository.saveAll(assignmentsToSave);

            // Now create and save verifications for assignments that have verification status
            List<ChecklistVerification> verificationsToSave = new ArrayList<>();
            for (TempPendingMaster temp : validTemps) {
                if (temp.verificationStatus != null && !temp.verificationStatus.trim().isEmpty()) {
                    StatusMaster resolvedVerStatus = statusMap.get(temp.verificationStatus.toUpperCase());
                    ChecklistVerification verification = new ChecklistVerification();
                    verification.setAssignment(temp.assignment);
                    verification.setVerifiedBy(temp.lstUpdateUserIdCd);
                    verification.setVerifiedDate(temp.verificationDate != null ? temp.verificationDate : temp.assignment.getUpdatedAt());
                    verification.setStatus(resolvedVerStatus);
                    verification.setRemarks(temp.rejectionComments);
                    verificationsToSave.add(verification);
                }
            }

            if (!verificationsToSave.isEmpty()) {
                checklistVerificationRepository.saveAll(verificationsToSave);
            }

            entityManager.flush();
            entityManager.clear();

            totalMigrated += validTemps.size();
            totalSkipped += (batchTemps.size() - validTemps.size());

            if (batchTemps.size() < batchSize) {
                hasMore = false;
            } else {
                offset += batchSize;
            }
        }

        return "Successfully migrated " + totalMigrated
                + " close checklist records from HRMS_CHECKLIST_PENDING_MASTER to qms_checklist_assignment."
                + (totalSkipped > 0 ? " (Skipped " + totalSkipped + " records with no matching checklist.)" : "");
    }
}
