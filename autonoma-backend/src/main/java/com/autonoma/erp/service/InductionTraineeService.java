package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class InductionTraineeService {

    @Autowired
    private InductionAssignmentRepository assignmentRepo;

    @Autowired
    private InductionTrainingDetailRepository detailRepo;

    @Autowired
    private InductionMasterRepository masterRepo;

    @Autowired
    private EmployeeMasterRepository empRepo;

    /**
     * Get trainee records for the current employee (login-filtered).
     * Only shows records with currentStatus = 'TRAINING GIVEN'.
     */
    public List<InductionAssignment> getForTrainee(String empCode) {
<<<<<<< HEAD
=======
        if ("*".equals(empCode)) {
            return assignmentRepo.findAllTraineeRecordsForAdmin();
        }
>>>>>>> origin/main
        return assignmentRepo.findTraineeRecords(empCode);
    }

    /**
     * Get training detail items for a specific assignment (trainee view).
     * Enriches with InductionMaster data.
     */
    public List<InductionTrainingDetail> getDetails(Long assignmentId) {
        List<InductionTrainingDetail> details = detailRepo.findByAssignmentId(assignmentId);

        for (InductionTrainingDetail detail : details) {
            masterRepo.findById(detail.getInductionMasterId()).ifPresent(master -> {
                detail.setInductionDetails(master.getInductionDetails());
                detail.setAnswer(master.getAnswer());
                detail.setInductionRound(master.getInductionRound());
                detail.setAttachmentRequired(master.getAttachmentRequired());
<<<<<<< HEAD
=======
                detail.setInductionAttachment(master.getInductionAttachment());
>>>>>>> origin/main
            });
        }
        return details;
    }

    /**
     * Submit trainee responses:
     * - If ALL items = UNDERSTOOD → assignment status = COMPLETED
     * - If ANY item = NEED MORE TRAINING → assignment status = REJECTED
     * - Also checks if ALL rounds completed → updates EmployeeMaster.inductionStatus
     */
    @Transactional
    public InductionAssignment submitResponses(Long assignmentId, List<InductionTrainingDetail> responses, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!"TRAINING GIVEN".equalsIgnoreCase(assignment.getCurrentStatus())) {
            throw new RuntimeException("Can only submit responses for 'TRAINING GIVEN' assignments. Current: " + assignment.getCurrentStatus());
        }

        // Update each detail with trainee response
        boolean hasRejection = false;
        for (InductionTrainingDetail response : responses) {
            InductionTrainingDetail existing = detailRepo.findById(response.getId())
                    .orElseThrow(() -> new RuntimeException("Detail item not found: " + response.getId()));

            if (!existing.getAssignmentId().equals(assignmentId)) {
                throw new RuntimeException("Detail item does not belong to this assignment");
            }

            // Validate trainee status is set
            if (response.getTraineeStatus() == null || response.getTraineeStatus().isEmpty()) {
                throw new RuntimeException("Please select trainee status for all items.");
            }

            // Validate trainee comments are not empty
            if (response.getTraineeComments() == null || response.getTraineeComments().trim().isEmpty()) {
                throw new RuntimeException("Comments should not be empty for all items.");
            }

            existing.setTraineeStatus(response.getTraineeStatus());
            existing.setTraineeComments(response.getTraineeComments());
            existing.setUpdatedBy(currentUser);
            existing.setUpdatedAt(new Date());
            detailRepo.save(existing);

            if ("NEED MORE TRAINING".equalsIgnoreCase(response.getTraineeStatus())) {
                hasRejection = true;
            }
        }

        if (hasRejection) {
            // REJECTION flow: mark as REJECTED, needs rescheduling
            assignment.setCurrentStatus("REJECTED");
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            assignmentRepo.save(assignment);
        } else {
            // ALL UNDERSTOOD: mark as COMPLETED
            assignment.setCurrentStatus("COMPLETED");
            assignment.setTrainingCompletedAt(new Date());
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            assignmentRepo.save(assignment);

            // Check if ALL rounds are now completed for this employee
            checkAndCompleteInduction(assignment.getEmpCode());
        }

        return assignment;
    }

    /**
     * Checks if ALL active induction rounds for an employee are COMPLETED.
     * If so, updates EmployeeMaster.inductionStatus = 'COMPLETED'.
     */
    private void checkAndCompleteInduction(String empCode) {
        long incompleteCount = assignmentRepo.countIncompleteByEmpCode(empCode);
        if (incompleteCount == 0) {
            // All rounds completed — update EmployeeMaster
            empRepo.findByEmpCode(empCode).ifPresent(emp -> {
                emp.setInductionStatus("COMPLETED");
                emp.setUpdatedAt(new Date());
                empRepo.save(emp);
            });
        }
    }
}
