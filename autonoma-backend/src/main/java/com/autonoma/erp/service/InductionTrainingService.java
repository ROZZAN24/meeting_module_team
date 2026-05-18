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
    private DepartmentRepository deptRepo;

    /**
     * Get assignments for a specific trainer (login-filtered).
     */
    public List<InductionAssignment> getForTrainer(String trainerEmpCode) {
        List<InductionAssignment> list = assignmentRepo.findByTrainerEmpCode(trainerEmpCode);
        enrichProgress(list);
        return list;
    }

    /**
     * Get ALL assignments (Admin/HR view).
     */
    public List<InductionAssignment> getAll() {
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
            masterRepo.findById(detail.getInductionMasterId()).ifPresent(master -> {
                detail.setInductionDetails(master.getInductionDetails());
                detail.setAnswer(master.getAnswer());
                detail.setInductionRound(master.getInductionRound());
                detail.setAttachmentRequired(master.getAttachmentRequired());
                detail.setInductionAttachment(master.getInductionAttachment());
            });
        }
        return activeDetails;
    }

    /**
     * Start a training session for the currently active level in sequential order.
     */
    @Transactional
    public InductionAssignment startTraining(Long assignmentId, String currentUser) {
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
                
        if (!activeDetails.isEmpty()) {
            assignment.setCurrentStatus("TRAINING STARTED");
            assignment.setTrainingStartedAt(new Date());
            assignment.setUpdatedBy(currentUser);
            assignment.setUpdatedAt(new Date());
            return assignmentRepo.save(assignment);
        }

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
                })
                .collect(Collectors.toList());

        if (criteria.isEmpty()) {
            throw new RuntimeException("No induction criteria found for active level: " + activeLvl + " in round: " + round);
        }

        for (InductionMaster master : criteria) {
            InductionTrainingDetail detail = new InductionTrainingDetail();
            detail.setAssignmentId(assignmentId);
            detail.setInductionMasterId(master.getId());
            detail.setTrainerStatus("PENDING");
            detail.setCreatedBy(currentUser);
            detail.setCreatedAt(new Date());
            detailRepo.save(detail);
        }

        assignment.setCurrentStatus("TRAINING STARTED");
        assignment.setTrainingStartedAt(new Date());
        assignment.setUpdatedBy(currentUser);
        assignment.setUpdatedAt(new Date());
        return assignmentRepo.save(assignment);
    }

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
     * Completes the training for the active level.
     * If there are further levels assigned, transitions back to RESCHEDULE status to allow next level training.
     * If all assigned levels are fully completed, transitions to TRAINING GIVEN status.
     */
    @Transactional
    public InductionAssignment completeTraining(Long assignmentId, String currentUser) {
        InductionAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

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
                .filter(d -> !"COMPLETED".equalsIgnoreCase(d.getTrainerStatus()))
                .count();
        if (pendingCount > 0) {
            throw new RuntimeException("Please complete all trainer status. " + pendingCount + " items still pending.");
        }

        long noRating = activeDetails.stream()
                .filter(d -> d.getSkillRating() == null || d.getSkillRating() < 1)
                .count();
        if (noRating > 0) {
            throw new RuntimeException("Please select skill matrix rating for all items. " + noRating + " items without rating.");
        }

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
    }
}
