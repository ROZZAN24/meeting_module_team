package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ChecklistService {

    @Autowired
    private MasterChecklistRepository masterRepo;

    @Autowired
    private ChecklistAssignmentRepository assignRepo;

    @Autowired
    private ChecklistVerificationRepository verifyRepo;

    @Autowired
    private StatusMasterRepository statusRepo;

    @Autowired
    private ChecklistDepartmentRepository deptRepo;

    // --- Master Checklist ---

    public String getNextSequenceNumber() {
        return masterRepo.findFirstByOrderBySeqNoDesc()
                .map(latest -> incrementSequence(latest.getSeqNo(), "CK-"))
                .orElse("CK-001");
    }

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty())
            return prefix + "001";
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest.trim());
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = Math.max(numericPart.length(), 3);
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()).trim() + nextNum;
            }
            return prefix + "001";
        } catch (Exception e) {
            return prefix + "001";
        }
    }

    /**
     * Retrieves master checklists based on comprehensive filtering criteria.
     *
     * @param status       The lifecycle status of the checklist (e.g., Active, Inactive).
     * @param category     The functional category (RENEWAL, CHECK LIST).
     * @param department   Optional department filter.
     * @param searchBy     The field to perform textual search on.
     * @param searchValue  The textual search term.
     * @param dualCheck    Filter for dual verification requirements.
     * @param verifyStatus Filter by the current verification workflow state.
     * @param pageable     Pagination and sorting configuration.
     * @return A paginated result set of MasterChecklist entities.
     */
    public Page<MasterChecklist> getAllChecklists(String status, String category, String department, String searchBy,
            String searchValue, String dualCheck, String verifyStatus,
            String seqNo, String frequency, String checkingPoint, String description,
            String stockLink, String photoRequired, String carryForward, Pageable pageable) {
        return masterRepo.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dualCheck != null && !dualCheck.isEmpty() && !dualCheck.equals("All")) {
                predicates.add(cb.equal(root.get("dualCheck"), dualCheck));
            }

            if (verifyStatus != null && !verifyStatus.isEmpty() && !verifyStatus.equals("All")) {
                predicates.add(cb.equal(root.get("verifyStatus"), verifyStatus));
            }

            if (status != null && !status.equals("All")) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (category != null && !category.equals("All")) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (department != null && !department.isEmpty()) {
                Join<MasterChecklist, ChecklistDepartment> deptJoin = root.join("departments");
                predicates.add(cb.equal(deptJoin.get("departmentName"), department));
            }

            if (seqNo != null && !seqNo.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("seqNo")), "%" + seqNo.toLowerCase() + "%"));
            }

            if (frequency != null && !frequency.isEmpty() && !frequency.equals("All")) {
                predicates.add(cb.equal(root.get("frequency"), frequency));
            }

            if (checkingPoint != null && !checkingPoint.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("checkingPoint")), "%" + checkingPoint.toLowerCase() + "%"));
            }

            if (description != null && !description.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%"));
            }

            if (stockLink != null && !stockLink.isEmpty() && !stockLink.equals("All")) {
                predicates.add(cb.equal(root.get("stockLink"), stockLink));
            }

            if (photoRequired != null && !photoRequired.isEmpty() && !photoRequired.equals("All")) {
                predicates.add(cb.equal(root.get("photoRequired"), photoRequired));
            }

            if (carryForward != null && !carryForward.isEmpty() && !carryForward.equals("All")) {
                predicates.add(cb.equal(root.get("carryForward"), carryForward));
            }

            if (searchValue != null && !searchValue.isEmpty()) {
                String searchTerm = "%" + searchValue.toLowerCase() + "%";
                if (searchBy != null && !searchBy.isEmpty()) {
                    if (searchBy.contains(".")) {
                        String[] parts = searchBy.split("\\.");
                        Path<Object> p = root.get(parts[0]);
                        for (int i = 1; i < parts.length; i++) {
                            p = p.get(parts[i]);
                        }
                        predicates.add(cb.like(cb.lower(p.as(String.class)), searchTerm));
                    } else {
                        // Safely cast to string for SQL Server compatibility
                        predicates.add(cb.like(cb.lower(root.get(searchBy).as(String.class)), searchTerm));
                    }
                } else {
                    List<Predicate> orPredicates = new ArrayList<>();
                    orPredicates.add(cb.like(cb.lower(root.get("seqNo").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("checkingPoint").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("category").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("frequency").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("status").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("createdBy").as(String.class)), searchTerm));

                    Join<MasterChecklist, ChecklistDepartment> dJoin = root.join("departments", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(dJoin.get("departmentName").as(String.class)), searchTerm));

                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public MasterChecklist saveMasterChecklist(MasterChecklist checklist, List<String> departments) {
        // SOP Rule 26: Duplicate Validation (Same Category + Same Checking Point + Same Department)
        if (departments != null && !departments.isEmpty()) {
            List<MasterChecklist> duplicates = masterRepo.findDuplicates(
                    checklist.getCategory(),
                    checklist.getCheckingPoint(),
                    departments,
                    checklist.getId());
            if (!duplicates.isEmpty()) {
                throw new IllegalArgumentException(
                        "A checklist with the same Category and Checking Point already exists for one or more selected departments.");
            }
        }

        if (checklist.getId() != null) {
            MasterChecklist existing = masterRepo.findById(checklist.getId()).orElseThrow();

            boolean isAmendmentOfVerified = "Verified".equals(existing.getVerifyStatus()) &&
                    checklist.getAmendmentReason() != null &&
                    !checklist.getAmendmentReason().isEmpty();

            if (isAmendmentOfVerified) {
                // Create a new version for the amendment. The old one remains active until this
                // new one is verified.
                checklist.setId(null);
                checklist.setVerifyStatus("Pending for Verify");
                checklist.setStatus("Active");
                checklist.setCreatedDate(new Date());
                if (checklist.getUpdatedBy() != null) {
                    checklist.setCreatedBy(checklist.getUpdatedBy());
                } else if (checklist.getCreatedBy() == null) {
                    checklist.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                }

                MasterChecklist saved = masterRepo.save(checklist);

                if (departments != null) {
                    for (String deptName : departments) {
                        ChecklistDepartment dept = new ChecklistDepartment();
                        dept.setChecklist(saved);
                        dept.setDepartmentName(deptName);
                        deptRepo.save(dept);
                    }
                }
                return saved;
            }

            // Normal update (either not verified yet, or no amendment reason)
            existing.setSeqNo(checklist.getSeqNo() != null ? checklist.getSeqNo() : existing.getSeqNo());
            existing.setCheckingPoint(checklist.getCheckingPoint() != null ? checklist.getCheckingPoint() : existing.getCheckingPoint());
            existing.setDescription(checklist.getDescription() != null ? checklist.getDescription() : existing.getDescription());
            existing.setCategory(checklist.getCategory() != null ? checklist.getCategory() : existing.getCategory());
            existing.setFrequency(checklist.getFrequency() != null ? checklist.getFrequency() : existing.getFrequency());
            existing.setEffectiveFrom(checklist.getEffectiveFrom() != null ? checklist.getEffectiveFrom() : existing.getEffectiveFrom());
            existing.setExpiryDate(checklist.getExpiryDate());
            existing.setReminderDays(checklist.getReminderDays());
            existing.setReminderDate(checklist.getReminderDate());
            existing.setStockLink(checklist.getStockLink() != null ? checklist.getStockLink() : existing.getStockLink());
            existing.setPhotoRequired(checklist.getPhotoRequired() != null ? checklist.getPhotoRequired() : existing.getPhotoRequired());
            existing.setVerificationRequired(checklist.getVerificationRequired() != null ? checklist.getVerificationRequired() : existing.getVerificationRequired());
            existing.setDualCheck(checklist.getDualCheck() != null ? checklist.getDualCheck() : existing.getDualCheck());
            existing.setCarryForward(checklist.getCarryForward() != null ? checklist.getCarryForward() : existing.getCarryForward());
            
            existing.setWeekDays(checklist.getWeekDays() != null ? checklist.getWeekDays() : existing.getWeekDays());
            existing.setRepeatEveryValue(checklist.getRepeatEveryValue() != null ? checklist.getRepeatEveryValue() : existing.getRepeatEveryValue());
            existing.setRepeatEveryUnit(checklist.getRepeatEveryUnit() != null ? checklist.getRepeatEveryUnit() : existing.getRepeatEveryUnit());

            if (checklist.getStatus() != null) {
                existing.setStatus(checklist.getStatus());
            } else if (existing.getStatus() == null) {
                existing.setStatus("Active");
            }

            if (checklist.getVerifyStatus() != null) {
                existing.setVerifyStatus(checklist.getVerifyStatus());
            } else if (existing.getVerifyStatus() == null || "Rejected".equals(existing.getVerifyStatus())) {
                existing.setVerifyStatus("Pending for Verify");
            }

            if (checklist.getAmendmentReason() != null && !checklist.getAmendmentReason().isEmpty()) {
                existing.setVerifyStatus("Pending for Verify");
            }

            if (checklist.getVerifiedBy() != null) existing.setVerifiedBy(checklist.getVerifiedBy());
            if (checklist.getVerifiedDate() != null) existing.setVerifiedDate(checklist.getVerifiedDate());
            if (checklist.getRejReason() != null) existing.setRejReason(checklist.getRejReason());
            if (checklist.getAssignTo() != null) existing.setAssignTo(checklist.getAssignTo());
            if (checklist.getAssignDate() != null) existing.setAssignDate(checklist.getAssignDate());
            if (checklist.getItemCode() != null) existing.setItemCode(checklist.getItemCode());
            if (checklist.getQty() != null) existing.setQty(checklist.getQty());
            if (checklist.getLevelIds() != null) existing.setLevelIds(checklist.getLevelIds());
            if (checklist.getAmendmentReason() != null) existing.setAmendmentReason(checklist.getAmendmentReason());
            if (checklist.getUploadedFiles() != null) existing.setUploadedFiles(checklist.getUploadedFiles());
            if (checklist.getScannedFiles() != null) existing.setScannedFiles(checklist.getScannedFiles());
            existing.setUpdatedDate(new Date());

            // Re-sync departments safely via the managed list of the existing entity to avoid Hibernate state desync
            if (existing.getDepartments() != null) {
                existing.getDepartments().clear();
            } else {
                existing.setDepartments(new ArrayList<>());
            }
            if (departments != null) {
                for (String deptName : departments) {
                    ChecklistDepartment dept = new ChecklistDepartment();
                    dept.setChecklist(existing);
                    dept.setDepartmentName(deptName);
                    existing.getDepartments().add(dept);
                }
            }
            return masterRepo.save(existing);
        } else {
            checklist.setCreatedDate(new Date());
            if (checklist.getStatus() == null)
                checklist.setStatus("Active");
            if (checklist.getVerifyStatus() == null)
                checklist.setVerifyStatus("Pending for Verify");
            if (checklist.getCreatedBy() == null || checklist.getCreatedBy().isEmpty()) {
                checklist.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
            }
            MasterChecklist saved = masterRepo.save(checklist);

            if (departments != null) {
                for (String deptName : departments) {
                    ChecklistDepartment dept = new ChecklistDepartment();
                    dept.setChecklist(saved);
                    dept.setDepartmentName(deptName);
                    deptRepo.save(dept);
                }
            }

            // Automatic Assignment Trigger (Wiring 1)
            if (saved.getAssignTo() != null && !saved.getAssignTo().isEmpty()) {
                assignTask(null, saved.getId(), saved.getAssignTo(),
                        saved.getCreatedBy() != null ? saved.getCreatedBy() : "System", "PRIMARY");
            }

            return saved;
        }
    }

    @Transactional
    public void deleteMasterChecklist(Long id) {
        MasterChecklist checklist = masterRepo.findById(id).orElseThrow();
        // Automatic cascade delete handles assignments, verifications, and departments
        masterRepo.delete(checklist);
    }

    // --- Assignments ---

    public Page<ChecklistAssignment> getAssignments(String status, String assignedTo, Date fromDate, Date toDate,
            String category, String searchBy, String searchValue, String masterVerifyStatus, String taskType,
            String currentUser, boolean excludeCompleted, String dualCheck, Pageable pageable) {

        return assignRepo.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<ChecklistAssignment, MasterChecklist> masterJoin = null;

            if (masterVerifyStatus != null && !masterVerifyStatus.isEmpty()) {
                masterJoin = root.join("checklist");
                if ("Verified".equals(masterVerifyStatus)) {
                    predicates.add(masterJoin.get("verifyStatus").in("Verified", "Accepted"));
                } else {
                    predicates.add(cb.equal(masterJoin.get("verifyStatus"), masterVerifyStatus));
                }
            }

            if (dualCheck != null && !dualCheck.isEmpty() && !dualCheck.equals("All")) {
                if (masterJoin == null) {
                    masterJoin = root.join("checklist");
                }
                predicates.add(cb.equal(masterJoin.get("dualCheck"), dualCheck));
            }

            // Task Type Logic (SOP Item 8)
            if ("Mine".equalsIgnoreCase(taskType) && currentUser != null) {
                predicates.add(cb.equal(root.get("assignedTo"), currentUser));
            } else if ("Team".equalsIgnoreCase(taskType)) {
                // For simplicity, we assume 'Team' means tasks for the user's department.
                // This would normally involve joining with Employee departments.
                // For now, we allow the UI to pass specific 'assignedTo' names for the team.
            }

            if (status != null && !status.equals("All")) {
                Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                predicates.add(cb.equal(statusJoin.get("name"), status));
            } else if (excludeCompleted) {
                // If "All" is selected and we want to focus on execution, exclude completed/finalized tasks
                Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                predicates.add(cb.not(statusJoin.get("name").in("Completed", "Verified", "Accepted")));
            }

            if (assignedTo != null && !assignedTo.isEmpty()) {
                if (assignedTo.contains(",")) {
                    // Multi-select support
                    String[] users = assignedTo.split(",");
                    List<Predicate> orUserPreds = new ArrayList<>();
                    for (String user : users) {
                        orUserPreds.add(cb.equal(root.get("assignedTo"), user.trim()));
                    }
                    predicates.add(cb.or(orUserPreds.toArray(new Predicate[0])));
                } else {
                    predicates.add(cb.like(cb.lower(root.get("assignedTo")), "%" + assignedTo.toLowerCase() + "%"));
                }
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("checklistDate"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("checklistDate"), toDate));
            }

            if (category != null && !category.equals("All")) {
                if (masterJoin == null) {
                    masterJoin = root.join("checklist");
                }
                predicates.add(cb.equal(masterJoin.get("category"), category));
            }

            if (searchValue != null && !searchValue.isEmpty()) {
                String searchTerm = "%" + searchValue.toLowerCase() + "%";
                if (searchBy != null && !searchBy.isEmpty()) {
                    if (searchBy.contains(".")) {
                        String[] parts = searchBy.split("\\.");
                        Path<Object> p = root.get(parts[0]);
                        for (int i = 1; i < parts.length; i++) {
                            p = p.get(parts[i]);
                        }
                        predicates.add(cb.like(cb.lower(p.as(String.class)), searchTerm));
                    } else {
                        predicates.add(cb.like(cb.lower(root.get(searchBy).as(String.class)), searchTerm));
                    }
                } else {
                    List<Predicate> orPredicates = new ArrayList<>();
                    orPredicates.add(cb.like(cb.lower(root.get("assignedTo")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("assignedBy")), searchTerm));

                    Join<ChecklistAssignment, StatusMaster> sJoin = root.join("status", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(sJoin.get("name")), searchTerm));

                    Join<ChecklistAssignment, MasterChecklist> cJoin = root.join("checklist", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(cJoin.get("seqNo")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("checkingPoint")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("category")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("frequency")), searchTerm));

                    Join<MasterChecklist, ChecklistDepartment> dJoin = cJoin.join("departments", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(dJoin.get("departmentName")), searchTerm));

                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public ChecklistAssignment assignTask(Long id, Long checklistId, String assignedTo, String assignedBy,
            String assignType) {
        return assignTask(id, checklistId, assignedTo, assignedBy, assignType, new Date());
    }

    @Transactional
    public ChecklistAssignment assignTask(Long id, Long checklistId, String assignedTo, String assignedBy,
            String assignType, Date checklistDate) {
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();

        ChecklistAssignment assignment;
        if (id != null) {
            assignment = assignRepo.findById(id).orElse(new ChecklistAssignment());
        } else {
            // Prevent duplicate assignments for same person on same checklist for same date
            if (assignRepo.findByChecklistIdAndAssignedToAndChecklistDate(checklistId, assignedTo, checklistDate)
                    .isPresent()) {
                // Return a dummy object or handle in controller to avoid 409 red console error
                ChecklistAssignment duplicate = new ChecklistAssignment();
                duplicate.setRemarks("DUPLICATE_ASSIGNMENT");
                return duplicate;
            }
            assignment = new ChecklistAssignment();
            // Default status: Pending (only for new)
            statusRepo.findByName("Pending").ifPresent(assignment::setStatus);
        }

        assignment.setChecklist(checklist);
        assignment.setAssignedTo(assignedTo);
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignType(assignType);
        assignment.setAssignedDate(new Date());
        assignment.setChecklistDate(checklistDate);

        ChecklistAssignment savedAssignment = assignRepo.save(assignment);

        // Also update the MasterChecklist for the UI data table to show ALL assignees
        java.util.List<ChecklistAssignment> allAssignments = assignRepo.findByChecklistId(checklistId);
        String allAssignedTo = allAssignments.stream()
                .filter(a -> a.getAssignedTo() != null && !a.getAssignedTo().isEmpty())
                .map(ChecklistAssignment::getAssignedTo)
                .distinct()
                .collect(java.util.stream.Collectors.joining(", "));

        checklist.setAssignTo(allAssignedTo);
        checklist.setAssignDate(new Date());
        checklist.setTaskStatus("Pending");
        masterRepo.save(checklist);

        return savedAssignment;
    }

    @Transactional
    public void deleteAssignment(Long id) {
        ChecklistAssignment assignment = assignRepo.findById(id).orElseThrow();
        MasterChecklist checklist = assignment.getChecklist();
        assignRepo.deleteById(id);

        // Recalculate assigned users
        java.util.List<ChecklistAssignment> allAssignments = assignRepo.findByChecklistId(checklist.getId());
        String allAssignedTo = allAssignments.stream()
                .filter(a -> !a.getId().equals(id) && a.getAssignedTo() != null && !a.getAssignedTo().isEmpty())
                .map(ChecklistAssignment::getAssignedTo)
                .distinct()
                .collect(java.util.stream.Collectors.joining(", "));

        checklist.setAssignTo(allAssignedTo);
        if (allAssignedTo.isEmpty()) {
            checklist.setAssignDate(null);
            checklist.setTaskStatus(null);
        }
        masterRepo.save(checklist);
    }

    // --- Verification ---

    @Transactional
    public ChecklistVerification verifyTask(Long assignmentId, String verifiedBy, String statusName, String remarks,
            List<String> actualFiles) {
        ChecklistAssignment assignment = assignRepo.findById(assignmentId).orElseThrow();
        MasterChecklist master = assignment.getChecklist();

        // DUAL CHECK LOGIC:
        // If status is 'Completed' but Master has Dual Check enabled,
        // force status to 'Pending for Verified'.
        String finalStatusName = statusName;
        if ("Completed".equalsIgnoreCase(statusName) && "YES".equalsIgnoreCase(master.getDualCheck())) {
            finalStatusName = "Pending for Verified";
        }

        StatusMaster status = statusRepo.findByName(finalStatusName).orElseThrow();

        // Update assignment details
        assignment.setStatus(status);
        assignment.setRemarks(remarks); // PERSIST REMARKS TO ASSIGNMENT
        if (actualFiles != null) {
            assignment.setActualFiles(actualFiles);
        }
        assignment.setUpdatedBy(verifiedBy);
        assignment.setUpdatedAt(new Date());
        assignRepo.save(assignment);

        // Create verification record
        ChecklistVerification verification = new ChecklistVerification();
        verification.setAssignment(assignment);
        verification.setVerifiedBy(verifiedBy);
        verification.setStatus(status);
        verification.setRemarks(remarks);
        verification.setVerifiedDate(new Date());

        ChecklistVerification savedVerify = verifyRepo.save(verification);

        // RECURRING LOGIC:
        // If final status is 'Verified' or 'Accepted' (or 'Completed' if Dual Check is NO),
        // we should generate the next assignment if it's a recurring task.
        boolean isFinalized = "Verified".equalsIgnoreCase(finalStatusName) ||
                "Accepted".equalsIgnoreCase(finalStatusName) ||
                ("Completed".equalsIgnoreCase(finalStatusName) && !"YES".equalsIgnoreCase(master.getDualCheck()));

        if (isFinalized && master.getFrequency() != null && !"ONE TIME".equalsIgnoreCase(master.getFrequency())) {
            generateNextAssignment(assignment);
        }

        return savedVerify;
    }

    private void generateNextAssignment(ChecklistAssignment current) {
        MasterChecklist master = current.getChecklist();
        String freq = master.getFrequency().toUpperCase();
        Date currentDate = current.getChecklistDate() != null ? current.getChecklistDate() : new Date();

        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(currentDate);

        switch (freq) {
            case "DAILY":
                cal.add(java.util.Calendar.DATE, 1);
                break;
            case "WEEKLY":
                cal.add(java.util.Calendar.DATE, 7);
                break;
            case "MONTHLY":
                cal.add(java.util.Calendar.MONTH, 1);
                break;
            case "QUARTERLY":
                cal.add(java.util.Calendar.MONTH, 3);
                break;
            case "YEARLY":
                cal.add(java.util.Calendar.YEAR, 1);
                break;
            default:
                return; // No recurrence
        }

        Date nextDate = cal.getTime();

        // DUPLICATE PREVENTION: Check if a future assignment for this date already exists
        boolean exists = assignRepo.existsByChecklistIdAndAssignedToAndChecklistDate(
                master.getId(), current.getAssignedTo(), nextDate);
        if (exists)
            return; // Skip if already generated

        // Create new assignment
        ChecklistAssignment next = new ChecklistAssignment();
        next.setChecklist(master);
        next.setAssignedTo(current.getAssignedTo());
        next.setAssignedBy("System (Auto-Gen)");
        next.setAssignType(current.getAssignType());
        next.setAssignedDate(new Date());
        next.setChecklistDate(nextDate);
        statusRepo.findByName("Pending").ifPresent(next::setStatus);

        assignRepo.save(next);
    }

    @Transactional
    public MasterChecklist verifyMasterChecklist(Long checklistId, String verifiedBy, String status, String remarks) {
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();
        checklist.setVerifyStatus(status);
        checklist.setVerifiedBy(verifiedBy);
        checklist.setVerifiedDate(new Date());
        if ("Rejected".equals(status)) {
            checklist.setRejReason(remarks);
        } else if ("Verified".equals(status)) {
            // Once the new version is verified, invalidate older versions with the same
            // sequence number
            java.util.List<MasterChecklist> oldVersions = masterRepo.findBySeqNoAndIdNot(checklist.getSeqNo(),
                    checklist.getId());
            for (MasterChecklist old : oldVersions) {
                if (!"In Active".equals(old.getStatus())) {
                    old.setStatus("In Active");
                    masterRepo.save(old);
                }
            }
        }
        return masterRepo.save(checklist);
    }

    // --- Status Master Helpers ---

    @Transactional
    public void seedStatuses() {
        String[] statuses = {
                "Pending", "Started", "Unresolved", "Missed", "Completed",
                "Not Completed", "25%", "50%", "75%", "Pending for Verified",
                "Verified", "Pending for Accepted", "Accepted", "Attended", "Rejected", "Open"
        };
        for (String s : statuses) {
            if (statusRepo.findByName(s).isEmpty()) {
                StatusMaster sm = new StatusMaster();
                sm.setName(s);
                statusRepo.save(sm);
            }
        }
    }
}
