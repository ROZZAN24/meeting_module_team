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

<<<<<<< HEAD
=======
    @Autowired
    private DepartmentRepository deptRepo;

>>>>>>> origin/main
    /**
     * Get assignments for a specific trainer (login-filtered).
     */
    public List<InductionAssignment> getForTrainer(String trainerEmpCode) {
<<<<<<< HEAD
        return assignmentRepo.findByTrainerEmpCode(trainerEmpCode);
=======
        List<InductionAssignment> list = assignmentRepo.findByTrainerEmpCode(trainerEmpCode);
        enrichProgress(list);
        return list;
>>>>>>> origin/main
    }

    /**
     * Get ALL assignments (Admin/HR view).
     */
    public List<InductionAssignment> getAll() {
<<<<<<< HEAD
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
=======
        List<InductionAssignment> list = assignmentRepo.findAllActive();
        enrichProgress(list);
        return list;
    }

    private void enrichProgress(List<InductionAssignment> assignments) {
        for (InductionAssignment assignment : assignments) {
            if ("TRAINING STARTED".equalsIgnoreCase(assignment.getCurrentStatus())) {
                List<InductionTrainingDetail> allDetails = detailRepo.findByAssignmentId(assignment.getId());
                String activeLvl = getActiveLevel(assignment, allDetails);
                
                List<InductionTrainingDetail> activeDetails = allDetails.stream()
                        .filter(d -> {
                            Optional<InductionMaster> masterOpt = masterRepo.findById(d.getInductionMasterId());
                            return masterOpt.map(master -> isLevelMatch(master.getLevelCodes(), activeLvl)).orElse(false);
                        })
                        .collect(Collectors.toList());
                        
                assignment.setTotalQuestions(activeDetails.size());
                long completed = activeDetails.stream()
                        .filter(d -> "COMPLETED".equalsIgnoreCase(d.getTrainerStatus()))
                        .count();
                assignment.setCompletedQuestions((int) completed);
            } else {
                assignment.setTotalQuestions(0);
                assignment.setCompletedQuestions(0);
            }
        }
    }

    /**
     * Helper to get numerical level from string ("Level 1" -> 1, "L2" -> 2, etc.)
     */
    public static int getLevelNumber(String levelStr) {
        if (levelStr == null) return 999;
        String clean = levelStr.replaceAll("[^0-9]", "");
        if (clean.isEmpty()) return 999;
        return Integer.parseInt(clean);
    }

    /**
     * Check if master level code matches target level (supports L1/Level 1/1 formats)
     */
    public static boolean isLevelMatch(String masterLevels, String targetLevel) {
        if (masterLevels == null || targetLevel == null) return false;
        String[] parts = masterLevels.split(",");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.equalsIgnoreCase("ALL")) return true;
            if (trimmed.equalsIgnoreCase(targetLevel)) return true;
            
            int mNum = getLevelNumber(trimmed);
            int tNum = getLevelNumber(targetLevel);
            if (mNum != 999 && mNum == tNum) {
                return true;
            }
        }
        return false;
    }

    /**
     * Dynamically determines which assigned level is currently active.
     * Ascending order checks which levels are either unstarted or not yet fully completed.
     */
    public String getActiveLevel(InductionAssignment assignment, List<InductionTrainingDetail> allDetails) {
        String screeningLevelStr = assignment.getScreeningLevel();
        if (screeningLevelStr == null || screeningLevelStr.trim().isEmpty()) {
            return "Level 1";
        }
        
        List<String> levels = Arrays.stream(screeningLevelStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .sorted(Comparator.comparingInt(InductionTrainingService::getLevelNumber))
                .collect(Collectors.toList());
                
        if (levels.isEmpty()) {
            return "Level 1";
        }
        
        for (String lvl : levels) {
            List<InductionTrainingDetail> lvlDetails = allDetails.stream()
                    .filter(d -> {
                        Optional<InductionMaster> masterOpt = masterRepo.findById(d.getInductionMasterId());
                        return masterOpt.map(master -> isLevelMatch(master.getLevelCodes(), lvl)).orElse(false);
                    })
                    .collect(Collectors.toList());
                    
            if (lvlDetails.isEmpty()) {
                return lvl; // Level not started yet, so it is the active one!
            }
            
            boolean allCompleted = lvlDetails.stream()
                    .allMatch(d -> "COMPLETED".equalsIgnoreCase(d.getTrainerStatus()));
                    
            if (!allCompleted) {
                return lvl; // Level is currently in progress!
            }
        }
        
        // All assigned levels completed, default to the last one
        return levels.get(levels.size() - 1);
    }

    /**
     * Get training detail items for the currently active level only.
     */
    public List<InductionTrainingDetail> getDetails(Long assignmentId) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
                
        List<InductionTrainingDetail> allDetails = detailRepo.findByAssignmentId(assignmentId);
        String activeLvl = getActiveLevel(assignment, allDetails);
        
        List<InductionTrainingDetail> activeDetails = allDetails.stream()
                .filter(d -> {
                    Optional<InductionMaster> masterOpt = masterRepo.findById(d.getInductionMasterId());
                    return masterOpt.map(master -> isLevelMatch(master.getLevelCodes(), activeLvl)).orElse(false);
                })
                .collect(Collectors.toList());

        for (InductionTrainingDetail detail : activeDetails) {
>>>>>>> origin/main
            masterRepo.findById(detail.getInductionMasterId()).ifPresent(master -> {
                detail.setInductionDetails(master.getInductionDetails());
                detail.setAnswer(master.getAnswer());
                detail.setInductionRound(master.getInductionRound());
                detail.setAttachmentRequired(master.getAttachmentRequired());
<<<<<<< HEAD
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
=======
                detail.setInductionAttachment(master.getInductionAttachment());
            });
        }
        return activeDetails;
    }

    /**
     * Start a training session for the currently active level in sequential order.
>>>>>>> origin/main
     */
    @Transactional
    public InductionAssignment startTraining(Long assignmentId, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

<<<<<<< HEAD
        if (!"PENDING".equalsIgnoreCase(assignment.getCurrentStatus()) 
            && !"RESCHEDULE".equalsIgnoreCase(assignment.getCurrentStatus())) {
            throw new RuntimeException("Training can only be started from PENDING or RESCHEDULE status. Current: " + assignment.getCurrentStatus());
        }

        // Check if detail rows already exist (re-start case)
        List<InductionTrainingDetail> existing = detailRepo.findByAssignmentId(assignmentId);
        if (!existing.isEmpty()) {
            // Already started before — just update status
=======
        List<InductionTrainingDetail> allDetails = detailRepo.findByAssignmentId(assignmentId);
        String activeLvl = getActiveLevel(assignment, allDetails);
        
        List<InductionTrainingDetail> activeDetails = allDetails.stream()
                .filter(d -> {
                    Optional<InductionMaster> masterOpt = masterRepo.findById(d.getInductionMasterId());
                    return masterOpt.map(master -> isLevelMatch(master.getLevelCodes(), activeLvl)).orElse(false);
                })
                .collect(Collectors.toList());
                
        if (!activeDetails.isEmpty()) {
>>>>>>> origin/main
            assignment.setCurrentStatus("TRAINING STARTED");
            assignment.setTrainingStartedAt(new Date());
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            return assignmentRepo.save(assignment);
        }

<<<<<<< HEAD
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
=======
        // Create new detail rows for activeLvl
        String round = assignment.getInductionRound();
        List<InductionMaster> criteria = masterRepo.findByRoundAndActive(round);
        final String empDept = assignment.getDepartment();
        List<Department> allDepts = deptRepo.findAll();
        final Optional<Department> matchedDept = allDepts.stream()
                .filter(d -> (d.getDepartmentName() != null && d.getDepartmentName().equalsIgnoreCase(empDept))
                        || (d.getDepartmentNo() != null && d.getDepartmentNo().equalsIgnoreCase(empDept))
                        || (d.getId() != null && d.getId().toString().equals(empDept)))
                .findFirst();

        criteria = criteria.stream()
                .filter(c -> {
                    boolean deptMatch = true;
                    if (c.getDepartmentCodes() != null && !c.getDepartmentCodes().trim().isEmpty()
                            && empDept != null && !empDept.trim().isEmpty()) {
                        String codes = c.getDepartmentCodes();
                        boolean matchesAny = codes.equalsIgnoreCase("ALL") || codes.contains(empDept);
                        if (matchedDept.isPresent()) {
                            Department d = matchedDept.get();
                            matchesAny = matchesAny 
                                    || codes.contains(d.getDepartmentName())
                                    || (d.getDepartmentNo() != null && codes.contains(d.getDepartmentNo()))
                                    || codes.contains(d.getId().toString());
                        }
                        List<String> codeList = Arrays.asList(codes.split(","));
                        boolean exactMatch = codeList.stream().anyMatch(code -> {
                            String trimmed = code.trim();
                            if (trimmed.equalsIgnoreCase("ALL")) return true;
                            if (trimmed.equalsIgnoreCase(empDept)) return true;
                            if (matchedDept.isPresent()) {
                                Department d = matchedDept.get();
                                return trimmed.equalsIgnoreCase(d.getDepartmentName())
                                        || trimmed.equalsIgnoreCase(d.getDepartmentNo())
                                        || trimmed.equalsIgnoreCase(d.getId().toString());
                            }
                            return false;
                        });
                        deptMatch = matchesAny || exactMatch;
                    }

                    // For global company-wide rounds, bypass department restriction
                    if (round != null && !"DEPARTMENT".equalsIgnoreCase(round)) {
                        deptMatch = true;
                    }

                    return deptMatch && isLevelMatch(c.getLevelCodes(), activeLvl);
>>>>>>> origin/main
                })
                .collect(Collectors.toList());

        if (criteria.isEmpty()) {
<<<<<<< HEAD
            throw new RuntimeException("No induction criteria found for round: " + round + ". Please assign criteria first in Induction Criteria page.");
        }

        // Create detail rows
=======
            throw new RuntimeException("No induction criteria found for active level: " + activeLvl + " in round: " + round);
        }

>>>>>>> origin/main
        for (InductionMaster master : criteria) {
            InductionTrainingDetail detail = new InductionTrainingDetail();
            detail.setAssignmentId(assignmentId);
            detail.setInductionMasterId(master.getId());
            detail.setTrainerStatus("PENDING");
            detail.setCreatedBy(currentUser);
            detail.setCreatedAt(new Date());
            detailRepo.save(detail);
        }

<<<<<<< HEAD
        // Update assignment
=======
>>>>>>> origin/main
        assignment.setCurrentStatus("TRAINING STARTED");
        assignment.setTrainingStartedAt(new Date());
        assignment.setUpdatedBy(currentUser);
        assignment.setUpdatedAt(new Date());
        return assignmentRepo.save(assignment);
    }

<<<<<<< HEAD
    /**
     * Save training progress (batch update detail items).
     */
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
     * Complete training:
     * 1. Validate all items have trainerStatus = COMPLETED
     * 2. Validate all items have skillRating
     * 3. Calculate average rating
     * 4. Update assignment to TRAINING GIVEN
=======
     * Completes the training for the active level.
     * If there are further levels assigned, transitions back to RESCHEDULE status to allow next level training.
     * If all assigned levels are fully completed, transitions to TRAINING GIVEN status.
>>>>>>> origin/main
     */
    @Transactional
    public InductionAssignment completeTraining(Long assignmentId, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

<<<<<<< HEAD
        List<InductionTrainingDetail> details = detailRepo.findByAssignmentId(assignmentId);

        if (details.isEmpty()) {
            throw new RuntimeException("No training details found. Please start training first.");
        }

        // Validate all items completed
        long pendingCount = details.stream()
=======
        List<InductionTrainingDetail> allDetails = detailRepo.findByAssignmentId(assignmentId);
        if (allDetails.isEmpty()) {
            throw new RuntimeException("No training details found. Please start training first.");
        }

        String activeLvl = getActiveLevel(assignment, allDetails);
        
        List<InductionTrainingDetail> activeDetails = allDetails.stream()
                .filter(d -> {
                    Optional<InductionMaster> masterOpt = masterRepo.findById(d.getInductionMasterId());
                    return masterOpt.map(master -> isLevelMatch(master.getLevelCodes(), activeLvl)).orElse(false);
                })
                .collect(Collectors.toList());

        long pendingCount = activeDetails.stream()
>>>>>>> origin/main
                .filter(d -> !"COMPLETED".equalsIgnoreCase(d.getTrainerStatus()))
                .count();
        if (pendingCount > 0) {
            throw new RuntimeException("Please complete all trainer status. " + pendingCount + " items still pending.");
        }

<<<<<<< HEAD
        // Validate all items have skill rating
        long noRating = details.stream()
=======
        long noRating = activeDetails.stream()
>>>>>>> origin/main
                .filter(d -> d.getSkillRating() == null || d.getSkillRating() < 1)
                .count();
        if (noRating > 0) {
            throw new RuntimeException("Please select skill matrix rating for all items. " + noRating + " items without rating.");
        }

<<<<<<< HEAD
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
=======
        // Determine if more levels exist
        String screeningLevelStr = assignment.getScreeningLevel();
        List<String> assignedLevels = Arrays.stream(screeningLevelStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .sorted(Comparator.comparingInt(InductionTrainingService::getLevelNumber))
                .collect(Collectors.toList());
                
        int currentLvlIdx = assignedLevels.indexOf(activeLvl);
        
        if (currentLvlIdx != -1 && currentLvlIdx < assignedLevels.size() - 1) {
            // More levels left! Reschedule status makes it active to start next level.
            assignment.setCurrentStatus("RESCHEDULE");
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            return assignmentRepo.save(assignment);
        } else {
            // All levels fully cleared
            double avgRating = allDetails.stream()
                    .mapToInt(InductionTrainingDetail::getSkillRating)
                    .average()
                    .orElse(0.0);

            assignment.setCurrentStatus("TRAINING GIVEN");
            assignment.setAverageRating(avgRating);
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            return assignmentRepo.save(assignment);
        }
>>>>>>> origin/main
    }
}
