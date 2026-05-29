package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InductionTrainingService {

    @Autowired
    private InductionAssignmentRepository assignmentRepo;

    @Autowired
    private InductionTrainingDetailRepository detailRepo;

    @Autowired
    private InductionMasterRepository masterRepo;

    @Autowired
    private EmployeeMasterRepository empRepo;

    @Autowired
    private DepartmentRepository departmentRepo;

    /**
     * Get assignments for a specific trainer (login-filtered).
     */
    public List<InductionAssignment> getForTrainer(String trainerEmpCode) {
        return assignmentRepo.findByTrainerEmpCode(trainerEmpCode);
    }

    /**
     * Get ALL assignments (Admin/HR view).
     */
    public List<InductionAssignment> getAll() {
        return assignmentRepo.findAllActive();
    }

    /**
     * Helper method to get matching criteria from InductionMaster based on assignment details.
     */
    private List<InductionMaster> getMatchingCriteria(InductionAssignment assignment) {
        String round = assignment.getInductionRound();
        List<InductionMaster> criteria = masterRepo.findByRoundAndActive(round);

        String empDept = assignment.getDepartment();
        String empDeptId = null;
        String empDeptCode = null;
        if (empDept != null && !empDept.trim().isEmpty()) {
            Optional<Department> deptOpt = departmentRepo.findAll().stream()
                    .filter(d -> d.getDepartmentName() != null && 
                                (d.getDepartmentName().equalsIgnoreCase(empDept) || 
                                 (d.getDepartmentNo() != null && d.getDepartmentNo().equalsIgnoreCase(empDept))))
                    .findFirst();
            if (deptOpt.isPresent()) {
                empDeptId = String.valueOf(deptOpt.get().getId());
                empDeptCode = deptOpt.get().getDepartmentNo();
            }
        }

        String screeningLevel = assignment.getScreeningLevel();
        String empLevelCode = null;
        if (screeningLevel != null) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\d+").matcher(screeningLevel);
            if (matcher.find()) {
                empLevelCode = "L" + matcher.group();
            }
        }

        final String finalDeptId = empDeptId;
        final String finalDeptCode = empDeptCode;
        final String finalLevelCode = empLevelCode;

        return criteria.stream()
                .filter(c -> {
                    // Department match
                    if (c.getDepartmentCodes() != null && !c.getDepartmentCodes().trim().isEmpty() && empDept != null && !empDept.isEmpty()) {
                        List<String> codes = Arrays.stream(c.getDepartmentCodes().split(","))
                                .map(String::trim)
                                .map(String::toUpperCase)
                                .collect(Collectors.toList());
                        boolean deptMatch = codes.contains("ALL") || 
                                            (finalDeptId != null && codes.contains(finalDeptId)) ||
                                            (finalDeptCode != null && codes.contains(finalDeptCode.toUpperCase())) ||
                                            codes.contains(empDept.trim().toUpperCase());
                        if (!deptMatch) {
                            return false;
                        }
                    }
                    // Level match
                    if (c.getLevelCodes() != null && !c.getLevelCodes().trim().isEmpty()) {
                        List<String> codes = Arrays.stream(c.getLevelCodes().split(","))
                                .map(String::trim)
                                .map(String::toUpperCase)
                                .collect(Collectors.toList());
                        boolean levelMatch = codes.contains("ALL") || 
                                             (finalLevelCode != null && codes.contains(finalLevelCode.toUpperCase())) ||
                                             (screeningLevel != null && codes.contains(screeningLevel.trim().toUpperCase()));
                        if (!levelMatch) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get training detail items for a specific assignment.
     * Enriches each detail row with the criteria text from InductionMaster.
     * Automatically synchronizes with the source of truth (InductionMaster criteria).
     */
    @Transactional
    public List<InductionTrainingDetail> getDetails(Long assignmentId) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        List<InductionTrainingDetail> details = detailRepo.findByAssignmentId(assignmentId);

        // Synchronize with InductionMaster if training is started or completed
        if ("TRAINING STARTED".equalsIgnoreCase(assignment.getCurrentStatus()) || "TRAINING GIVEN".equalsIgnoreCase(assignment.getCurrentStatus())) {
            List<InductionMaster> activeCriteria = getMatchingCriteria(assignment);
            Set<Long> activeCriteriaIds = activeCriteria.stream().map(InductionMaster::getId).collect(Collectors.toSet());
            Set<Long> existingMasterIds = details.stream().map(InductionTrainingDetail::getInductionMasterId).collect(Collectors.toSet());

            boolean changed = false;

            // 1. Add new criteria that were added to the master
            for (InductionMaster master : activeCriteria) {
                if (!existingMasterIds.contains(master.getId())) {
                    InductionTrainingDetail detail = new InductionTrainingDetail();
                    detail.setAssignmentId(assignmentId);
                    detail.setInductionMasterId(master.getId());
                    detail.setTrainerStatus("PENDING");
                    detail.setCreatedBy("SYSTEM");
                    detail.setCreatedAt(new Date());
                    detailRepo.save(detail);
                    changed = true;
                }
            }

            // 2. Remove criteria that are no longer active/matching in the master
            for (InductionTrainingDetail detail : details) {
                if (!activeCriteriaIds.contains(detail.getInductionMasterId())) {
                    detailRepo.delete(detail);
                    changed = true;
                }
            }

            if (changed) {
                details = detailRepo.findByAssignmentId(assignmentId);
            }
        }

        // Enrich with InductionMaster data (transient fields)
        for (InductionTrainingDetail detail : details) {
            masterRepo.findById(detail.getInductionMasterId()).ifPresent(master -> {
                detail.setInductionDetails(master.getInductionDetails());
                detail.setAnswer(master.getAnswer());
                detail.setInductionRound(master.getInductionRound());
                detail.setAttachmentRequired(master.getAttachmentRequired());
                detail.setAttachmentPath(master.getInductionAttachment());
            });
        }
        return details;
    }

    /**
     * Start a training session:
     * 1. Validate scheduled time has been reached
     * 2. Load matching criteria from InductionMaster
     * 3. Create detail rows for each criteria
     * 4. Update assignment status to TRAINING_STARTED
     */
    @Transactional
    public InductionAssignment startTraining(Long assignmentId, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!"PENDING".equalsIgnoreCase(assignment.getCurrentStatus()) 
            && !"RESCHEDULE".equalsIgnoreCase(assignment.getCurrentStatus())) {
            throw new RuntimeException("Training can only be started from PENDING or RESCHEDULE status. Current: " + assignment.getCurrentStatus());
        }

        // Clear any existing training detail rows (re-start/reschedule case) to ensure fresh criteria are loaded
        List<InductionTrainingDetail> existing = detailRepo.findByAssignmentId(assignmentId);
        if (!existing.isEmpty()) {
            detailRepo.deleteAll(existing);
        }

        // Load matching criteria from InductionMaster
        List<InductionMaster> criteria = getMatchingCriteria(assignment);

        if (criteria.isEmpty()) {
            throw new RuntimeException("No active induction criteria configured in the master for round: " + assignment.getInductionRound() +
                    ", department: " + assignment.getDepartment() + ", level: " + assignment.getScreeningLevel() + ". Please define criteria first.");
        }

        // Create detail rows
        for (InductionMaster master : criteria) {
            InductionTrainingDetail detail = new InductionTrainingDetail();
            detail.setAssignmentId(assignmentId);
            detail.setInductionMasterId(master.getId());
            detail.setTrainerStatus("PENDING");
            detail.setAttachmentPath(master.getInductionAttachment());
            detail.setCreatedBy(currentUser);
            detail.setCreatedAt(new Date());
            detailRepo.save(detail);
        }

        // Update assignment
        assignment.setCurrentStatus("TRAINING STARTED");
        assignment.setTrainingStartedAt(new Date());
        assignment.setUpdatedBy(currentUser);
        assignment.setUpdatedAt(new Date());
        return assignmentRepo.save(assignment);
    }

    /**
     * Save training progress (batch update detail items).
     */
    @Transactional
    public void saveProgress(Long assignmentId, List<InductionTrainingDetail> updates, String currentUser) {
        for (InductionTrainingDetail update : updates) {
            InductionTrainingDetail existing = detailRepo.findById(update.getId())
                    .orElseThrow(() -> new RuntimeException("Detail item not found: " + update.getId()));

            if (!existing.getAssignmentId().equals(assignmentId)) {
                throw new RuntimeException("Detail item does not belong to this assignment");
            }

            existing.setTrainerStatus(update.getTrainerStatus());
            existing.setTrainerComments(update.getTrainerComments());
            existing.setSkillRating(update.getSkillRating());
            masterRepo.findById(existing.getInductionMasterId()).ifPresent(master -> {
                existing.setAttachmentPath(master.getInductionAttachment());
            });
            existing.setUpdatedBy(currentUser);
            existing.setUpdatedAt(new Date());
            detailRepo.save(existing);
        }
    }

    /**
     * Complete training:
     * 1. Validate all items have trainerStatus = COMPLETED
     * 2. Validate all items have skillRating
     * 3. Calculate average rating
     * 4. Update assignment to TRAINING GIVEN
     */
    @Transactional
    public InductionAssignment completeTraining(Long assignmentId, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        List<InductionTrainingDetail> details = detailRepo.findByAssignmentId(assignmentId);

        if (details.isEmpty()) {
            throw new RuntimeException("No training details found. Please start training first.");
        }

        // Validate all items completed
        long pendingCount = details.stream()
                .filter(d -> !"COMPLETED".equalsIgnoreCase(d.getTrainerStatus()))
                .count();
        if (pendingCount > 0) {
            throw new RuntimeException("Please complete all trainer status. " + pendingCount + " items still pending.");
        }

        // Validate all items have skill rating
        long noRating = details.stream()
                .filter(d -> d.getSkillRating() == null || d.getSkillRating() < 1)
                .count();
        if (noRating > 0) {
            throw new RuntimeException("Please select skill matrix rating for all items. " + noRating + " items without rating.");
        }

        // Calculate average rating
        double avgRating = details.stream()
                .mapToInt(InductionTrainingDetail::getSkillRating)
                .average()
                .orElse(0.0);

        // Update assignment
        assignment.setCurrentStatus("TRAINING GIVEN");
        assignment.setAverageRating(avgRating);
        assignment.setUpdatedBy(currentUser);
        assignment.setUpdatedAt(new Date());
        return assignmentRepo.save(assignment);
    }

    private InductionMaster createDefaultMaster(String details, String answer, String round, String currentUser) {
        InductionMaster m = new InductionMaster();
        m.setInductionDetails(details);
        m.setAnswer(answer);
        m.setDepartmentCodes("ALL");
        m.setLevelCodes("ALL");
        m.setInductionRound(round);
        m.setAttachmentRequired("NO");
        m.setStatus("ACTIVE");
        m.setCreatedBy(currentUser);
        m.setCreatedAt(new Date());
        return m;
    }
}
