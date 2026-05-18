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
     * Get training detail items for a specific assignment.
     * Enriches each detail row with the criteria text from InductionMaster.
     */
    public List<InductionTrainingDetail> getDetails(Long assignmentId) {
        List<InductionTrainingDetail> details = detailRepo.findByAssignmentId(assignmentId);

        // Enrich with InductionMaster data (transient fields)
        for (InductionTrainingDetail detail : details) {
            masterRepo.findById(detail.getInductionMasterId()).ifPresent(master -> {
                detail.setInductionDetails(master.getInductionDetails());
                detail.setAnswer(master.getAnswer());
                detail.setInductionRound(master.getInductionRound());
                detail.setAttachmentRequired(master.getAttachmentRequired());
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

        // Check if detail rows already exist (re-start case)
        List<InductionTrainingDetail> existing = detailRepo.findByAssignmentId(assignmentId);
        if (!existing.isEmpty()) {
            // Already started before — just update status
            assignment.setCurrentStatus("TRAINING STARTED");
            assignment.setTrainingStartedAt(new Date());
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            return assignmentRepo.save(assignment);
        }

        // Load matching criteria from InductionMaster
        String round = assignment.getInductionRound();
        List<InductionMaster> criteria = masterRepo.findByRoundAndActive(round);

        // Filter by department and level if the employee has those set
        String empDept = assignment.getDepartment();
        criteria = criteria.stream()
                .filter(c -> {
                    // Department match: criteria departmentCodes contains the employee's department
                    if (c.getDepartmentCodes() != null && empDept != null && !empDept.isEmpty()) {
                        // departmentCodes is comma-separated
                        return c.getDepartmentCodes().contains(empDept) || c.getDepartmentCodes().equalsIgnoreCase("ALL");
                    }
                    return true; // If no department filter, include all
                })
                .collect(Collectors.toList());

        if (criteria.isEmpty()) {
            throw new RuntimeException("No induction criteria found for round: " + round + ". Please assign criteria first in Induction Criteria page.");
        }

        // Create detail rows
        for (InductionMaster master : criteria) {
            InductionTrainingDetail detail = new InductionTrainingDetail();
            detail.setAssignmentId(assignmentId);
            detail.setInductionMasterId(master.getId());
            detail.setTrainerStatus("PENDING");
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
            existing.setAttachmentPath(update.getAttachmentPath());
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
}
