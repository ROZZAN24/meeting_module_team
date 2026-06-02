package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.repository.EmployeeMasterRepository;
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
    private StatusMasterRepository statusRepo;


    @Autowired
    private ChecklistDepartmentRepository deptRepo;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChecklistClosedRepository closedRepo;

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

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
            String stockLink, String photoRequired, String carryForward,
            Date fromDate, Date toDate, String considerDate, Date considerDateValue,
            Pageable pageable) {
        return masterRepo.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Date Range and Consider Date Filtering predicates
            if ("Yes".equalsIgnoreCase(considerDate) && considerDateValue != null) {
                java.util.Calendar calStart = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                calStart.setTime(considerDateValue);
                calStart.set(java.util.Calendar.HOUR_OF_DAY, 0);
                calStart.set(java.util.Calendar.MINUTE, 0);
                calStart.set(java.util.Calendar.SECOND, 0);
                calStart.set(java.util.Calendar.MILLISECOND, 0);
                Date dayStart = calStart.getTime();

                java.util.Calendar calEnd = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                calEnd.setTime(considerDateValue);
                calEnd.set(java.util.Calendar.HOUR_OF_DAY, 23);
                calEnd.set(java.util.Calendar.MINUTE, 59);
                calEnd.set(java.util.Calendar.SECOND, 59);
                calEnd.set(java.util.Calendar.MILLISECOND, 999);
                Date dayEnd = calEnd.getTime();

                Predicate createdOnDate = cb.between(root.get("createdDate"), dayStart, dayEnd);
                Predicate updatedOnDate = cb.between(root.get("updatedDate"), dayStart, dayEnd);
                predicates.add(cb.or(createdOnDate, updatedOnDate));
            } else {
                if (fromDate != null || toDate != null) {
                    Date rangeStart = fromDate;
                    if (rangeStart == null) {
                        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                        cal.set(1970, 0, 1, 0, 0, 0);
                        rangeStart = cal.getTime();
                    } else {
                        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                        cal.setTime(rangeStart);
                        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
                        cal.set(java.util.Calendar.MINUTE, 0);
                        cal.set(java.util.Calendar.SECOND, 0);
                        cal.set(java.util.Calendar.MILLISECOND, 0);
                        rangeStart = cal.getTime();
                    }

                    Date rangeEnd = toDate;
                    if (rangeEnd == null) {
                        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                        cal.set(2099, 11, 31, 23, 59, 59);
                        rangeEnd = cal.getTime();
                    } else {
                        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                        cal.setTime(rangeEnd);
                        cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
                        cal.set(java.util.Calendar.MINUTE, 59);
                        cal.set(java.util.Calendar.SECOND, 59);
                        cal.set(java.util.Calendar.MILLISECOND, 999);
                        rangeEnd = cal.getTime();
                    }

                    Predicate createdInRange = cb.between(root.get("createdDate"), rangeStart, rangeEnd);
                    Predicate updatedInRange = cb.between(root.get("updatedDate"), rangeStart, rangeEnd);
                    predicates.add(cb.or(createdInRange, updatedInRange));
                }
            }

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
                Subquery<Long> deptSub = query.subquery(Long.class);
                Root<ChecklistDepartment> deptRoot = deptSub.from(ChecklistDepartment.class);
                Join<ChecklistDepartment, Department> deptObjJoin = deptRoot.join("department");
                deptSub.select(deptRoot.get("checklist").get("id"));
                deptSub.where(cb.equal(deptObjJoin.get("departmentName"), department));
                predicates.add(root.get("id").in(deptSub));
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
                    orPredicates.add(cb.like(cb.lower(root.get("description")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("category").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("frequency").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("status").as(String.class)), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("createdBy").as(String.class)), searchTerm));

                    Subquery<Long> dSub = query.subquery(Long.class);
                    Root<ChecklistDepartment> dRoot = dSub.from(ChecklistDepartment.class);
                    Join<ChecklistDepartment, Department> dObj = dRoot.join("department");
                    dSub.select(dRoot.get("checklist").get("id"));
                    dSub.where(cb.like(cb.lower(dObj.get("departmentName").as(String.class)), searchTerm));
                    orPredicates.add(root.get("id").in(dSub));

                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
            }

            // distinct(true) removed to avoid dense_rank order by on TEXT/NVARCHAR(MAX) columns in SQL Server
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public MasterChecklist saveMasterChecklist(MasterChecklist checklist, List<String> departments) {
        boolean isAmendment = false;
        if (checklist.getId() != null) {
            MasterChecklist existing = masterRepo.findById(checklist.getId()).orElse(null);
            if (existing != null && "Verified".equals(existing.getVerifyStatus()) &&
                    checklist.getAmendmentReason() != null &&
                    !checklist.getAmendmentReason().isEmpty()) {
                isAmendment = true;
            }
        }

        // Duplicate Validation (Checking Point must be globally unique across all active/pending checklists)
        if (!isAmendment && checklist.getCheckingPoint() != null && !checklist.getCheckingPoint().trim().isEmpty()) {
            List<MasterChecklist> duplicates = masterRepo.findDuplicates(
                    checklist.getCheckingPoint().trim(),
                    checklist.getId());
            if (!duplicates.isEmpty()) {
                throw new IllegalArgumentException("Checking point should not be duplicated");
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
                if (checklist.getUpdatedBy() != null && !checklist.getUpdatedBy().isEmpty()) {
                    checklist.setCreatedBy(checklist.getUpdatedBy());
                } else if (checklist.getCreatedBy() == null || checklist.getCreatedBy().isEmpty()) {
                    checklist.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                }
                checklist.setUpdatedDate(null);
                checklist.setUpdatedBy(null);

                MasterChecklist saved = masterRepo.save(checklist);

                if (departments != null) {
                    for (String deptName : departments) {
                        ChecklistDepartment dept = new ChecklistDepartment();
                        dept.setChecklist(saved);
                        Department resolvedDept = departmentRepository.findByDepartmentName(deptName).orElse(null);
                        if (resolvedDept != null) {
                            dept.setDepartment(resolvedDept);
                            deptRepo.save(dept);
                        }
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

            // If the checklist was already Verified, and an edit occurs, drop it back to "Pending for Verify"
            if ("Verified".equals(existing.getVerifyStatus())) {
                existing.setVerifyStatus("Pending for Verify");
            } else if (checklist.getVerifyStatus() != null) {
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
            existing.setUpdatedBy(checklist.getUpdatedBy() != null && !checklist.getUpdatedBy().isEmpty() 
                    ? checklist.getUpdatedBy() 
                    : existing.getCreatedBy());

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
                    Department resolvedDept = departmentRepository.findByDepartmentName(deptName).orElse(null);
                    if (resolvedDept != null) {
                        dept.setDepartment(resolvedDept);
                        existing.getDepartments().add(dept);
                    }
                }
            }
            return masterRepo.save(existing);
        } else {
            checklist.setCreatedDate(new Date());
            if (checklist.getStatus() == null)
                checklist.setStatus("Active");
            if (checklist.getVerifyStatus() == null)
                checklist.setVerifyStatus("Pending for Verify");
            if (checklist.getCarryForwardStatus() == null)
                checklist.setCarryForwardStatus("NO");
            if (checklist.getCreatedBy() == null || checklist.getCreatedBy().isEmpty()) {
                checklist.setCreatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
            }
            checklist.setUpdatedDate(null);
            checklist.setUpdatedBy(null);
            MasterChecklist saved = masterRepo.save(checklist);

            if (departments != null) {
                for (String deptName : departments) {
                    ChecklistDepartment dept = new ChecklistDepartment();
                    dept.setChecklist(saved);
                    Department resolvedDept = departmentRepository.findByDepartmentName(deptName).orElse(null);
                    if (resolvedDept != null) {
                        dept.setDepartment(resolvedDept);
                        deptRepo.save(dept);
                    }
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
            String currentUser, boolean excludeCompleted, boolean excludePending, String dualCheck,
            String considerDate, Date considerDateValue, Pageable pageable) {

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
                // Show assignments that are either:
                // 1. Assigned to the current user (their own tasks), OR
                // 2. In a pending verification/acceptance state (tasks completed by others
                //    that need the current user — as admin/manager — to verify)
                Join<ChecklistAssignment, StatusMaster> mineStatusJoin = root.join("status", JoinType.LEFT);
                Predicate assignedToMe = cb.equal(cb.lower(root.get("assignedTo")), currentUser.toLowerCase());
                Predicate pendingVerification = mineStatusJoin.get("name").in("Pending for Verified", "Pending for Accepted");
                predicates.add(cb.or(assignedToMe, pendingVerification));
            } else if ("Team".equalsIgnoreCase(taskType)) {
                // For simplicity, we assume 'Team' means tasks for the user's department.
                // This would normally involve joining with Employee departments.
                // For now, we allow the UI to pass specific 'assignedTo' names for the team.
            }

            if (status != null && !status.equals("All") && !status.isEmpty()) {
                Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                if (status.contains(",")) {
                    String[] statusArr = status.split(",");
                    List<String> statusList = new ArrayList<>();
                    for (String s : statusArr) {
                        statusList.add(s.trim());
                    }
                    predicates.add(statusJoin.get("name").in(statusList));
                } else {
                    predicates.add(cb.equal(statusJoin.get("name"), status));
                }
            } else {
                if (excludeCompleted) {
                    // If "All" is selected and we want to focus on execution, exclude completed/finalized tasks
                    Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                    predicates.add(cb.not(statusJoin.get("name").in("Completed", "Verified", "Accepted")));
                }
                if (excludePending) {
                    Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                    predicates.add(cb.not(statusJoin.get("name").in("Pending", "Started")));
                }
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
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdDate"), fromDate));
            }

            Date effectiveToDate = toDate;
            if (effectiveToDate == null) {
                java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
                cal.set(java.util.Calendar.MINUTE, 59);
                cal.set(java.util.Calendar.SECOND, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                effectiveToDate = cal.getTime();
            } else {
                java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
                cal.setTime(effectiveToDate);
                cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
                cal.set(java.util.Calendar.MINUTE, 59);
                cal.set(java.util.Calendar.SECOND, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                effectiveToDate = cal.getTime();
            }
            predicates.add(cb.lessThanOrEqualTo(root.get("createdDate"), effectiveToDate));

            if ("Yes".equalsIgnoreCase(considerDate) && considerDateValue != null) {
                predicates.add(cb.equal(root.get("checklistDate"), considerDateValue));
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
                    Expression<String> expression;
                    if (searchBy.contains(".")) {
                        String[] parts = searchBy.split("\\.");
                        if ("checklist".equals(parts[0])) {
                            Join<ChecklistAssignment, MasterChecklist> cJoin = (masterJoin != null) ? masterJoin : root.join("checklist");
                            expression = cJoin.get(parts[1]);
                        } else if ("status".equals(parts[0])) {
                            Join<ChecklistAssignment, StatusMaster> sJoin = root.join("status");
                            expression = sJoin.get(parts[1]);
                        } else {
                            Path<Object> p = root.get(parts[0]);
                            for (int i = 1; i < parts.length; i++) {
                                p = p.get(parts[i]);
                            }
                            if (String.class.equals(p.getJavaType())) {
                                expression = (Expression<String>) (Expression<?>) p;
                            } else {
                                expression = p.as(String.class);
                            }
                        }
                    } else {
                        if (java.util.Arrays.asList("seqNo", "checkingPoint", "category", "frequency").contains(searchBy)) {
                            Join<ChecklistAssignment, MasterChecklist> cJoin = (masterJoin != null) ? masterJoin : root.join("checklist");
                            expression = cJoin.get(searchBy);
                        } else if ("status".equals(searchBy)) {
                            Join<ChecklistAssignment, StatusMaster> sJoin = root.join("status");
                            expression = sJoin.get("name");
                        } else {
                            Path<Object> p = root.get(searchBy);
                            if (String.class.equals(p.getJavaType())) {
                                expression = (Expression<String>) (Expression<?>) p;
                            } else {
                                expression = p.as(String.class);
                            }
                        }
                    }
                    predicates.add(cb.like(cb.lower(expression), searchTerm));
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

                    Subquery<Long> dSub = query.subquery(Long.class);
                    Root<ChecklistDepartment> dRoot = dSub.from(ChecklistDepartment.class);
                    Join<ChecklistDepartment, Department> dObj = dRoot.join("department");
                    dSub.select(dRoot.get("checklist").get("id"));
                    dSub.where(cb.like(cb.lower(dObj.get("departmentName")), searchTerm));
                    orPredicates.add(cJoin.get("id").in(dSub));

                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
            }

            // distinct(true) removed to avoid dense_rank order by on TEXT/NVARCHAR(MAX) columns in SQL Server
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public ChecklistAssignment assignTask(Long id, Long checklistId, String assignedTo, String assignedBy,
            String assignType) {
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();
        Date targetDate = new Date();
        if (checklist.getEffectiveFrom() != null) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyyMMdd");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
            String todayStr = sdf.format(targetDate);
            String effectiveStr = sdf.format(checklist.getEffectiveFrom());
            if (effectiveStr.compareTo(todayStr) > 0) {
                targetDate = checklist.getEffectiveFrom();
            }
        }
        return assignTask(id, checklistId, assignedTo, assignedBy, assignType, targetDate);
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
            assignment.setCarryForward(checklist.getCarryForward());
            assignment.setCarryForwardStatus("NO");
            assignment.setCarryForwardCount(0);
            // Default status: Pending (only for new)
            statusRepo.findByName("Pending").ifPresent(assignment::setStatus);
        }

        assignment.setChecklist(checklist);
        assignment.setAssignedTo(assignedTo);
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignType(assignType);
        assignment.setAssignedDate(new Date());
        assignment.setChecklistDate(checklistDate);

        // Save to active assignments table (QMS_CHECKLIST_ASSIGNMENT)
        ChecklistAssignment savedAssignment = assignRepo.save(assignment);
        
        // Sync to unified closed history table (QMS_CHECKLIST_CLOSED)
        saveToFrequencyTable(savedAssignment);

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
        checklist.setSkipAuditUpdate(true);
        masterRepo.save(checklist);

        return savedAssignment;
    }

    private void copyProperties(ChecklistAssignment src, ChecklistClosed dest) {
        dest.setChecklist(src.getChecklist());
        dest.setAssignedTo(src.getAssignedTo());
        dest.setAssignedBy(src.getAssignedBy());
        dest.setAssignedDate(src.getAssignedDate());
        dest.setStatus(src.getStatus());
        dest.setRemarks(src.getRemarks());
        dest.setChecklistDate(src.getChecklistDate());
        dest.setCarryForward(src.getCarryForward());
        dest.setCarryForwardStatus(src.getCarryForwardStatus());
        dest.setCarryForwardCount(src.getCarryForwardCount());
        dest.setAssignType(src.getAssignType());
        dest.setVerifiedBy(src.getVerifiedBy());
        dest.setVerifiedDate(src.getVerifiedDate());
        dest.setComments(src.getComments());
        dest.setFilePaths(src.getFilePaths());
        dest.setCreatedUser(src.getCreatedUser());
        dest.setCreatedAt(src.getCreatedAt());
        dest.setUpdatedUser(src.getUpdatedUser());
        dest.setUpdatedAt(src.getUpdatedAt());

        String freq = src.getChecklist().getFrequency();
        if (freq == null) {
            freq = "DAILY";
        }
        dest.setFrequency(freq.toUpperCase());
    }

    private ChecklistClosed saveToFrequencyTable(ChecklistAssignment source) {
        ChecklistClosed closed = closedRepo.findByChecklistIdAndAssignedToAndChecklistDate(
                source.getChecklist().getId(), source.getAssignedTo(), source.getChecklistDate())
                .orElse(new ChecklistClosed());
        copyProperties(source, closed);
        return closedRepo.save(closed);
    }

    private void deleteFromFrequencyTable(Long checklistId, String assignedTo, Date checklistDate, String freq) {
        closedRepo.findByChecklistIdAndAssignedToAndChecklistDate(checklistId, assignedTo, checklistDate)
                .ifPresent(closedRepo::delete);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        ChecklistAssignment assignment = assignRepo.findById(id).orElseThrow();
        MasterChecklist checklist = assignment.getChecklist();
        deleteFromFrequencyTable(checklist.getId(), assignment.getAssignedTo(), assignment.getChecklistDate(), checklist.getFrequency());

        assignRepo.delete(assignment);

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
        checklist.setSkipAuditUpdate(true);
        masterRepo.save(checklist);
    }

    // --- Verification ---

    @Transactional
    public ChecklistVerification verifyTask(Long assignmentId, String verifiedBy, String statusName, String remarks,
            List<String> actualFiles) {
        if (verifiedBy != null && ("Administrator".equalsIgnoreCase(verifiedBy) || "Admin istrator".equalsIgnoreCase(verifiedBy))) {
            verifiedBy = "Admin";
        }
        ChecklistAssignment assignment = assignRepo.findById(assignmentId).orElseThrow();
        MasterChecklist master = assignment.getChecklist();

        // ── USER REWORK COMPLETION WORKFLOW ──────────────────────────────────
        if ("Completed".equalsIgnoreCase(statusName) && assignment.getStatus() != null
                && ("Pending".equalsIgnoreCase(assignment.getStatus().getName())
                        || "Started".equalsIgnoreCase(assignment.getStatus().getName()))) {

            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
            String dateStr = assignment.getChecklistDate() != null ? sdf.format(assignment.getChecklistDate()) : "";

            java.util.List<ChecklistAssignment> allAssigned = assignRepo.findByChecklistId(master.getId());
            ChecklistAssignment oldRejected = null;
            if (allAssigned != null) {
                oldRejected = allAssigned.stream()
                    .filter(a -> a.getAssignedTo() != null
                            && a.getAssignedTo().equalsIgnoreCase(assignment.getAssignedTo()))
                    .filter(a -> a.getChecklistDate() != null
                            && sdf.format(a.getChecklistDate()).equals(dateStr))
                    .filter(a -> !a.getId().equals(assignment.getId()) && a.getStatus() != null
                            && "Rejected".equalsIgnoreCase(a.getStatus().getName()))
                    .findFirst().orElse(null);
            }

            if (oldRejected != null) {
                // Determine the target status for A
                boolean isUserAdmin = com.autonoma.erp.util.SecurityUtils.getCurrentUserId() != null &&
                        userRepository.findByUserId(com.autonoma.erp.util.SecurityUtils.getCurrentUserId())
                        .map(u -> u.getIsBosAdmin() != null && u.getIsBosAdmin() == 1)
                        .orElse(false);

                String nextStatusName;
                if (!isUserAdmin) {
                    nextStatusName = "Pending for Verified";
                } else {
                    nextStatusName = "YES".equalsIgnoreCase(master.getDualCheck())
                            ? "Pending for Verified" : "Completed";
                }
                StatusMaster aStatus = statusRepo.findByName(nextStatusName).orElseThrow();

                // Promote A
                oldRejected.setStatus(aStatus);
                oldRejected.setRemarks(remarks);
                if (actualFiles != null) {
                    oldRejected.setActualFiles(actualFiles);
                }
                oldRejected.setUpdatedBy(verifiedBy);
                oldRejected.setUpdatedAt(new Date());
                
                // Save A to assignRepo and frequency table
                ChecklistAssignment savedOldRejected = assignRepo.save(oldRejected);
                saveToFrequencyTable(savedOldRejected);

                // Delete B (the again-created helper assignment) entirely
                deleteFromFrequencyTable(assignment.getChecklist().getId(), assignment.getAssignedTo(), assignment.getChecklistDate(), assignment.getChecklist().getFrequency());
                assignRepo.delete(assignment);

                // Return a dummy verification object
                ChecklistVerification dummy = new ChecklistVerification();
                dummy.setAssignment(oldRejected);
                dummy.setVerifiedBy(verifiedBy);
                dummy.setStatus(aStatus);
                dummy.setRemarks(remarks);
                dummy.setVerifiedDate(new Date());
                return dummy;
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        // DUAL CHECK & WORKFLOW MAPPING LOGIC:
        String finalStatusName = statusName;
        if ("Completed".equalsIgnoreCase(statusName)) {
            boolean isUserAdmin = com.autonoma.erp.util.SecurityUtils.getCurrentUserId() != null &&
                    userRepository.findByUserId(com.autonoma.erp.util.SecurityUtils.getCurrentUserId())
                    .map(u -> u.getIsBosAdmin() != null && u.getIsBosAdmin() == 1)
                    .orElse(false);
            
            if (!isUserAdmin) {
                finalStatusName = "Pending for Verified";
            } else {
                if ("YES".equalsIgnoreCase(master.getDualCheck())) {
                    finalStatusName = "Pending for Verified";
                } else {
                    finalStatusName = "Completed";
                }
            }
        }

        StatusMaster status = statusRepo.findByName(finalStatusName).orElseThrow();

        // Update assignment details
        assignment.setStatus(status);
        assignment.setRemarks(remarks);
        if (actualFiles != null) {
            assignment.setActualFiles(actualFiles);
        }
        assignment.setUpdatedBy(verifiedBy);
        assignment.setUpdatedAt(new Date());

        // Consolidate manager verification columns if finalized/closed
        if ("Verified".equalsIgnoreCase(finalStatusName) || "Accepted".equalsIgnoreCase(finalStatusName) || "Completed".equalsIgnoreCase(finalStatusName)) {
            assignment.setVerifiedBy(verifiedBy);
            assignment.setVerifiedDate(new Date());
            assignment.setComments(remarks);
        }

        // Save active/closed details directly in the respective frequency table
        ChecklistAssignment savedAssignment = assignRepo.save(assignment);
        saveToFrequencyTable(savedAssignment);

        // Create a dummy verification object to return (deprecation safety)
        ChecklistVerification dummyVerification = new ChecklistVerification();
        dummyVerification.setAssignment(assignment);
        dummyVerification.setVerifiedBy(verifiedBy);
        dummyVerification.setStatus(status);
        dummyVerification.setRemarks(remarks);
        dummyVerification.setVerifiedDate(new Date());

        // MANAGER REJECTION WORKFLOW:
        if ("Rejected".equalsIgnoreCase(finalStatusName)) {
            boolean alreadyExists = false;
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
            String dateStr = assignment.getChecklistDate() != null ? sdf.format(assignment.getChecklistDate()) : "";

            java.util.List<ChecklistAssignment> allAssigned = assignRepo.findByChecklistId(master.getId());
            if (allAssigned != null) {
                alreadyExists = allAssigned.stream()
                    .filter(a -> a.getAssignedTo() != null && a.getAssignedTo().equalsIgnoreCase(assignment.getAssignedTo()))
                    .filter(a -> a.getChecklistDate() != null && sdf.format(a.getChecklistDate()).equals(dateStr))
                    .anyMatch(a -> !a.getId().equals(assignment.getId()) && a.getStatus() != null && 
                                   ("Pending".equalsIgnoreCase(a.getStatus().getName()) || "Started".equalsIgnoreCase(a.getStatus().getName())));
            }
            if (!alreadyExists) {
                ChecklistAssignment next = new ChecklistAssignment();
                next.setChecklist(master);
                next.setAssignedTo(assignment.getAssignedTo());
                next.setAssignedBy(verifiedBy);
                next.setAssignType(assignment.getAssignType());
                next.setAssignedDate(new Date());
                next.setChecklistDate(assignment.getChecklistDate());
                next.setCarryForward(master.getCarryForward());
                next.setCarryForwardStatus("NO");
                next.setCarryForwardCount(0);
                statusRepo.findByName("Pending").ifPresent(next::setStatus);
                ChecklistAssignment savedNext = assignRepo.save(next);
                saveToFrequencyTable(savedNext);
            }
        }

        boolean isFinalized = "Verified".equalsIgnoreCase(finalStatusName) ||
                "Accepted".equalsIgnoreCase(finalStatusName) ||
                ("Completed".equalsIgnoreCase(finalStatusName) && !"YES".equalsIgnoreCase(master.getDualCheck()));

        // ERASE ON VERIFY WORKFLOW:
        if (isFinalized) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
            String dateStr = assignment.getChecklistDate() != null ? sdf.format(assignment.getChecklistDate()) : "";

            java.util.List<ChecklistAssignment> allAssigned = assignRepo.findByChecklistId(master.getId());
            if (allAssigned != null) {
                java.util.List<ChecklistAssignment> matched = allAssigned.stream()
                    .filter(a -> a.getAssignedTo() != null && a.getAssignedTo().equalsIgnoreCase(assignment.getAssignedTo()))
                    .filter(a -> a.getChecklistDate() != null && sdf.format(a.getChecklistDate()).equals(dateStr))
                    .collect(java.util.stream.Collectors.toList());

                // 1. Delete all Rejected assignments
                java.util.List<ChecklistAssignment> rejectedList = matched.stream()
                    .filter(a -> !a.getId().equals(assignment.getId()) && a.getStatus() != null && "Rejected".equalsIgnoreCase(a.getStatus().getName()))
                    .collect(java.util.stream.Collectors.toList());
                if (!rejectedList.isEmpty()) {
                    for (ChecklistAssignment rej : rejectedList) {
                        deleteFromFrequencyTable(rej.getChecklist().getId(), rej.getAssignedTo(), rej.getChecklistDate(), rej.getChecklist().getFrequency());
                    }
                    assignRepo.deleteAll(rejectedList);
                }

                // 2. Delete the again-created checklist (which is Pending/Started)
                java.util.List<ChecklistAssignment> pendingList = matched.stream()
                    .filter(a -> !a.getId().equals(assignment.getId()) && a.getStatus() != null && 
                                ("Pending".equalsIgnoreCase(a.getStatus().getName()) || "Started".equalsIgnoreCase(a.getStatus().getName())))
                    .collect(java.util.stream.Collectors.toList());
                if (!pendingList.isEmpty()) {
                    for (ChecklistAssignment pend : pendingList) {
                        deleteFromFrequencyTable(pend.getChecklist().getId(), pend.getAssignedTo(), pend.getChecklistDate(), pend.getChecklist().getFrequency());
                    }
                    assignRepo.deleteAll(pendingList);
                }
            }
        }

        // RECURRING LOGIC:
        if (isFinalized && master.getFrequency() != null && !"ONE TIME".equalsIgnoreCase(master.getFrequency())) {
            generateNextAssignment(assignment);
        }

        return dummyVerification;
    }

    private void generateNextAssignment(ChecklistAssignment current) {
        MasterChecklist master = current.getChecklist();
        String freq = master.getFrequency().toUpperCase();
        Date currentDate = current.getChecklistDate() != null ? current.getChecklistDate() : new Date();

        java.util.Calendar cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
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

        ChecklistAssignment savedNext = assignRepo.save(next);
        saveToFrequencyTable(savedNext);
    }

    @Transactional
    public ChecklistAssignment saveAssignment(ChecklistAssignment assignment) {
        ChecklistAssignment savedAssignment = assignRepo.save(assignment);
        saveToFrequencyTable(savedAssignment);
        return savedAssignment;
    }

    @Transactional
    public MasterChecklist verifyMasterChecklist(Long checklistId, String verifiedBy, String status, String remarks) {
        if (verifiedBy != null && ("Administrator".equalsIgnoreCase(verifiedBy) || "Admin istrator".equalsIgnoreCase(verifiedBy))) {
            verifiedBy = "Admin";
        }
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();
        checklist.setVerifyStatus(status);
        checklist.setVerifiedBy(verifiedBy);
        checklist.setVerifiedDate(new Date());
        checklist.setSkipAuditUpdate(true);
        
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

    /**
     * One-time data repair: fixes assignments where ASSIGNED_TO was saved as
     * the employee display name instead of their empCode (userId).
     * Safe to call multiple times — it updates records that don't already
     * look like an empCode.
     */
    @Transactional
    public String repairAssignedToFields() {
        // Build a map: employeeName (lower) -> empCode
        java.util.Map<String, String> nameToCode = new java.util.HashMap<>();
        for (com.autonoma.erp.model.EmployeeMaster emp : employeeMasterRepository.findAll()) {
            if (emp.getEmpCode() != null && emp.getEmployeeName() != null) {
                nameToCode.put(emp.getEmployeeName().trim().toLowerCase(), emp.getEmpCode());
            }
        }

        // Collect all known empCodes so we can skip already-correct records
        java.util.Set<String> knownCodes = new java.util.HashSet<>(nameToCode.values());

        int fixedActive = 0;
        int fixedClosed = 0;
        int fixedMaster = 0;

        // 1. Repair active assignments
        java.util.List<ChecklistAssignment> allActive = assignRepo.findAll();
        for (ChecklistAssignment a : allActive) {
            String at = a.getAssignedTo();
            if (at == null || at.trim().isEmpty()) continue;
            if (knownCodes.contains(at.trim())) continue;
            String code = nameToCode.get(at.trim().toLowerCase());
            if (code != null) {
                a.setAssignedTo(code);
                assignRepo.save(a);
                fixedActive++;
            }
        }

        // 2. Repair closed history assignments
        java.util.List<ChecklistClosed> allClosed = closedRepo.findAll();
        for (ChecklistClosed c : allClosed) {
            String at = c.getAssignedTo();
            if (at == null || at.trim().isEmpty()) continue;
            if (knownCodes.contains(at.trim())) continue;
            String code = nameToCode.get(at.trim().toLowerCase());
            if (code != null) {
                c.setAssignedTo(code);
                closedRepo.save(c);
                fixedClosed++;
            }
        }

        // 3. Repair master checklists
        java.util.List<MasterChecklist> allMaster = masterRepo.findAll();
        for (MasterChecklist m : allMaster) {
            String at = m.getAssignTo();
            if (at != null && !at.trim().isEmpty()) {
                String[] parts = at.split(",");
                java.util.List<String> repairedParts = new java.util.ArrayList<>();
                boolean changed = false;
                for (String part : parts) {
                    String trimmed = part.trim();
                    if (knownCodes.contains(trimmed)) {
                        repairedParts.add(trimmed);
                    } else {
                        String code = nameToCode.get(trimmed.toLowerCase());
                        if (code != null) {
                            repairedParts.add(code);
                            changed = true;
                        } else {
                            repairedParts.add(trimmed);
                        }
                    }
                }
                if (changed) {
                    m.setAssignTo(String.join(", ", repairedParts));
                    masterRepo.save(m);
                    fixedMaster++;
                }
            }

            // 4. Recovery: If the master checklist has empty/null assignTo but has assignments in active/closed, restore it!
            if (m.getAssignTo() == null || m.getAssignTo().trim().isEmpty()) {
                java.util.Set<String> assignees = new java.util.HashSet<>();
                // Check active
                for (ChecklistAssignment a : allActive) {
                    if (a.getChecklist().getId().equals(m.getId()) && a.getAssignedTo() != null && !a.getAssignedTo().trim().isEmpty()) {
                        assignees.add(a.getAssignedTo().trim());
                    }
                }
                // Check closed
                for (ChecklistClosed c : allClosed) {
                    if (c.getChecklist().getId().equals(m.getId()) && c.getAssignedTo() != null && !c.getAssignedTo().trim().isEmpty()) {
                        assignees.add(c.getAssignedTo().trim());
                    }
                }
                if (!assignees.isEmpty()) {
                    // Repair those assignees if they are names
                    java.util.List<String> repairedAssignees = new java.util.ArrayList<>();
                    for (String asg : assignees) {
                        if (knownCodes.contains(asg)) {
                            repairedAssignees.add(asg);
                        } else {
                            String code = nameToCode.get(asg.toLowerCase());
                            if (code != null) {
                                repairedAssignees.add(code);
                            } else {
                                repairedAssignees.add(asg);
                            }
                        }
                    }
                    m.setAssignTo(String.join(", ", repairedAssignees));
                    m.setAssignDate(new Date());
                    m.setTaskStatus("Pending");
                    masterRepo.save(m);
                    fixedMaster++;
                }
            }
        }

        return String.format("Repaired: Active=%d, Closed=%d, Master=%d. Scanned: Active=%d, Closed=%d, Master=%d.",
            fixedActive, fixedClosed, fixedMaster, allActive.size(), allClosed.size(), allMaster.size());
    }
}
