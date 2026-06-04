package com.autonoma.erp.service;

import com.autonoma.erp.model.InductionAssignment;
import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.model.InductionReassignmentLog;
import com.autonoma.erp.model.DesignationLevel;
import com.autonoma.erp.model.Department;
import com.autonoma.erp.repository.InductionAssignmentRepository;
import com.autonoma.erp.repository.InductionTrainingDetailRepository;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import com.autonoma.erp.repository.InductionReassignmentLogRepository;
import com.autonoma.erp.repository.DesignationLevelRepository;
import com.autonoma.erp.repository.DepartmentRepository;
import com.autonoma.erp.service.admin.BosUserPageAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.List;

@Service
public class InductionAssignmentService {

    @Autowired
    private InductionAssignmentRepository repository;

    @Autowired
    private InductionTrainingDetailRepository trainingDetailRepository;

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private InductionReassignmentLogRepository inductionReassignmentLogRepository;

    @Autowired
    private DesignationLevelRepository designationLevelRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private BosUserPageAuthService authService;

    public List<InductionAssignment> getAll() {
        return repository.findAll();
    }

    public List<InductionAssignment> getActiveOnly() {
        return repository.findAllActive();
    }

    public List<InductionAssignment> getByEmpCode(String empCode) {
        return repository.findByEmpCode(empCode);
    }

    public void validateTrainerEligibility(EmployeeMaster trainee, EmployeeMaster trainer, String round) {
        if (trainer == null) {
            throw new RuntimeException("Trainer/Assessor is required.");
        }
        if (!"Active".equalsIgnoreCase(trainer.getStatus())) {
            throw new RuntimeException("Trainer must be Active. Selected trainer is inactive.");
        }
        if (!"YES".equalsIgnoreCase(trainer.getIsInductionEligible())) {
            throw new RuntimeException("Trainer does not have Induction Ability (isInductionEligible must be YES).");
        }
        if (!"COMPLETED".equalsIgnoreCase(trainer.getInductionStatus())) {
            throw new RuntimeException("Trainer must have completed their own induction.");
        }

        String deptName = "";
        if (trainer.getDepartment() != null) {
            deptName = trainer.getDepartment().getDepartmentName();
        } else if (trainer.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(trainer.getDepartmentId()).orElse(null);
            if (dept != null) {
                deptName = dept.getDepartmentName();
            }
        }
        if (deptName == null) deptName = "";
        deptName = deptName.toLowerCase().trim();

        if ("HR".equalsIgnoreCase(round)) {
            boolean matchesHR = deptName.contains("hr") || deptName.contains("h.r.") || 
                                 deptName.contains("human resource") || deptName.contains("people operations") || 
                                 deptName.contains("personnel");
            if (!matchesHR) {
                throw new RuntimeException("Trainer must belong to an HR department for the HR round. Department: " + deptName);
            }
        } else if ("QMS".equalsIgnoreCase(round)) {
            boolean matchesQMS = deptName.contains("qms") || deptName.contains("quality") || deptName.contains("q.m.s.");
            if (!matchesQMS) {
                throw new RuntimeException("Trainer must belong to a Quality/QMS department for the QMS round. Department: " + deptName);
            }
        } else if ("DEPARTMENT".equalsIgnoreCase(round)) {
            String traineeDept = "";
            if (trainee.getDepartment() != null) {
                traineeDept = trainee.getDepartment().getDepartmentName();
            } else if (trainee.getDepartmentId() != null) {
                Department dept = departmentRepository.findById(trainee.getDepartmentId()).orElse(null);
                if (dept != null) {
                    traineeDept = dept.getDepartmentName();
                }
            }
            if (traineeDept == null) traineeDept = "";
            if (!deptName.equalsIgnoreCase(traineeDept.toLowerCase().trim())) {
                throw new RuntimeException("Trainer's department (" + deptName + ") must exactly match trainee's department (" + traineeDept + ") for the DEPARTMENT round.");
            }
        } else if ("MANAGEMENT".equalsIgnoreCase(round)) {
            if (trainer.getEmpLevelId() == null) {
                throw new RuntimeException("Trainer must have a designation level assigned for the MANAGEMENT round.");
            }
            List<DesignationLevel> allLevels = designationLevelRepository.findAll();
            List<DesignationLevel> activeSortedLevels = allLevels.stream()
                .filter(l -> l.getIsActive() != null && l.getIsActive())
                .sorted(java.util.Comparator.comparingInt(DesignationLevel::getScreeningLevel))
                .collect(java.util.stream.Collectors.toList());
            if (activeSortedLevels.size() >= 2) {
                List<DesignationLevel> topTwo = activeSortedLevels.subList(activeSortedLevels.size() - 2, activeSortedLevels.size());
                boolean isTopTwo = topTwo.stream().anyMatch(l -> l.getRowId().equals(trainer.getEmpLevelId()));
                if (!isTopTwo) {
                    String topTwoNames = topTwo.stream().map(DesignationLevel::getLevel).collect(java.util.stream.Collectors.joining(", "));
                    throw new RuntimeException("Trainer's level must be one of the top 2 management levels (" + topTwoNames + ") for the MANAGEMENT round.");
                }
            }
        }
    }

    @Transactional
    public InductionAssignment save(InductionAssignment entity, String currentUser) {
        // 0. Permission Check: only write access to M2150 permitted
        if (!"SYSTEM".equalsIgnoreCase(currentUser) && !authService.hasPermission(currentUser, "M2150", "write")) {
            throw new RuntimeException("Unauthorized: You do not have permission to assign or reschedule inductions.");
        }

        // 1. Validations
        if (entity.getEmpCode() == null || entity.getEmpCode().isEmpty()) {
            throw new RuntimeException("Employee Code is mandatory.");
        }
        if (entity.getInductionRound() == null || entity.getInductionRound().isEmpty()) {
            throw new RuntimeException("Induction Round is mandatory.");
        }
        if (entity.getTrainerEmpCode() == null || entity.getTrainerEmpCode().isEmpty()) {
            throw new RuntimeException("Trainer Employee Code is mandatory.");
        }

        // Fetch Trainee and Trainer
        EmployeeMaster trainee = employeeMasterRepository.findByEmpCode(entity.getEmpCode())
            .orElseThrow(() -> new RuntimeException("Trainee employee not found: " + entity.getEmpCode()));
        EmployeeMaster newTrainer = employeeMasterRepository.findByEmpCode(entity.getTrainerEmpCode())
            .orElseThrow(() -> new RuntimeException("Trainer employee not found: " + entity.getTrainerEmpCode()));

        // Validate Trainer Eligibility
        validateTrainerEligibility(trainee, newTrainer, entity.getInductionRound());

        // Update trainer name in entity
        entity.setTrainerName(newTrainer.getEmployeeName());

        InductionAssignment savedEntity;

        if (entity.getId() != null) {
            // Edit assignment
            InductionAssignment original = repository.findById(entity.getId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found."));
            
            // Completed inductions cannot be modified
            if ("COMPLETED".equalsIgnoreCase(original.getCurrentStatus())) {
                throw new RuntimeException("Completed inductions cannot be modified.");
            }

            boolean trainerChanged = !original.getTrainerEmpCode().equalsIgnoreCase(entity.getTrainerEmpCode());
            boolean dateOrTimeChanged = (original.getInductionDate() == null || entity.getInductionDate() == null || 
                    !original.getInductionDate().equals(entity.getInductionDate())) ||
                    (original.getInductionTime() == null || entity.getInductionTime() == null || 
                    !original.getInductionTime().equalsIgnoreCase(entity.getInductionTime()));

            if (trainerChanged) {
                // Deactivate any other active assignment for this round
                List<InductionAssignment> existingActive = repository.findActiveAssignmentsByEmpAndRound(entity.getEmpCode(), entity.getInductionRound());
                for (InductionAssignment existing : existingActive) {
                    existing.setInductionStatus("IN ACTIVE");
                    existing.setCurrentStatus("IN ACTIVE");
                    existing.setUpdatedAt(new Date());
                    existing.setUpdatedBy(currentUser);
                    repository.save(existing);
                }

                // Deactivate original
                original.setInductionStatus("IN ACTIVE");
                original.setCurrentStatus("IN ACTIVE");
                original.setUpdatedAt(new Date());
                original.setUpdatedBy(currentUser);
                repository.save(original);

                // Create new assignment
                InductionAssignment newAssignment = new InductionAssignment();
                newAssignment.setEmpCode(entity.getEmpCode());
                newAssignment.setEmpName(trainee.getEmployeeName());
                newAssignment.setOldEmpCode(trainee.getOldEmpCode());
                
                String traineeDept = trainee.getDepartment() != null ? trainee.getDepartment().getDepartmentName() : null;
                String traineeDesig = trainee.getDesignation() != null ? trainee.getDesignation().getDesignationName() : null;
                newAssignment.setDepartment(traineeDept);
                newAssignment.setDesignation(traineeDesig);

                newAssignment.setInductionRound(entity.getInductionRound());
                newAssignment.setScreeningLevel(entity.getScreeningLevel());
                newAssignment.setInductionDate(entity.getInductionDate());
                newAssignment.setInductionTime(entity.getInductionTime());
                newAssignment.setTrainerName(newTrainer.getEmployeeName());
                newAssignment.setTrainerEmpCode(entity.getTrainerEmpCode());
                newAssignment.setCurrentStatus("PENDING");
                newAssignment.setInductionStatus("ACTIVE");
                newAssignment.setRemarks(entity.getRemarks());
                newAssignment.setCreatedAt(new Date());
                newAssignment.setCreatedBy(currentUser);

                savedEntity = repository.save(newAssignment);

                // Log reassignment
                InductionReassignmentLog log = new InductionReassignmentLog();
                log.setTraineeName(trainee.getEmployeeName());
                log.setTraineeEmpCode(trainee.getEmpCode());
                log.setInductionRound(entity.getInductionRound());
                log.setPreviousAssessor(original.getTrainerName());
                log.setPreviousAssessorEmpCode(original.getTrainerEmpCode());
                log.setNewAssessor(newTrainer.getEmployeeName());
                log.setNewAssessorEmpCode(newTrainer.getEmpCode());
                log.setReassignmentReason(entity.getRemarks());
                log.setReassignedBy(currentUser);
                log.setReassignedDateTime(new Date());
                inductionReassignmentLogRepository.save(log);
            } else {
                // Same trainer, update original (possibly rescheduled)
                original.setInductionDate(entity.getInductionDate());
                original.setInductionTime(entity.getInductionTime());
                original.setRemarks(entity.getRemarks());
                original.setScreeningLevel(entity.getScreeningLevel());
                original.setInductionRound(entity.getInductionRound());
                
                if (dateOrTimeChanged) {
                    original.setCurrentStatus("RESCHEDULE");

                    // Log reschedule
                    InductionReassignmentLog log = new InductionReassignmentLog();
                    log.setTraineeName(trainee.getEmployeeName());
                    log.setTraineeEmpCode(trainee.getEmpCode());
                    log.setInductionRound(entity.getInductionRound());
                    log.setPreviousAssessor(original.getTrainerName());
                    log.setPreviousAssessorEmpCode(original.getTrainerEmpCode());
                    log.setNewAssessor(original.getTrainerName());
                    log.setNewAssessorEmpCode(original.getTrainerEmpCode());
                    log.setReassignmentReason("Rescheduled: " + entity.getRemarks());
                    log.setReassignedBy(currentUser);
                    log.setReassignedDateTime(new Date());
                    inductionReassignmentLogRepository.save(log);
                }
                original.setUpdatedAt(new Date());
                original.setUpdatedBy(currentUser);
                savedEntity = repository.save(original);
            }
        } else {
            // Check for other active assignments for this trainee and round
            List<InductionAssignment> existingActive = repository.findActiveAssignmentsByEmpAndRound(entity.getEmpCode(), entity.getInductionRound());
            for (InductionAssignment existing : existingActive) {
                existing.setInductionStatus("IN ACTIVE");
                existing.setCurrentStatus("IN ACTIVE");
                existing.setUpdatedAt(new Date());
                existing.setUpdatedBy(currentUser);
                repository.save(existing);
            }

            // Create new record
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(currentUser);
            if (entity.getCurrentStatus() == null) {
                entity.setCurrentStatus("PENDING");
            }
            entity.setInductionStatus("ACTIVE");
            savedEntity = repository.save(entity);
        }

        // Update employee's status to Active and inductionStatus to PENDING
        employeeMasterRepository.findByEmpCode(entity.getEmpCode()).ifPresent(emp -> {
            emp.setInductionStatus("PENDING");
            emp.setStatus("Active");
            employeeMasterRepository.save(emp);
        });

        return savedEntity;
    }

    @Transactional
    public void updateStatus(Long id, String newStatus, String currentUser) {
        InductionAssignment existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found."));
        
        String current = existing.getCurrentStatus();
        boolean allowed = false;

        if ("PENDING".equals(current) && ("TRAINING GIVEN".equals(newStatus) || "RESCHEDULE".equals(newStatus))) allowed = true;
        else if ("RESCHEDULE".equals(current) && "PENDING".equals(newStatus)) allowed = true;
        else if ("TRAINING GIVEN".equals(current) && "COMPLETED".equals(newStatus)) allowed = true;

        if (!allowed && !"COMPLETED".equals(current)) {
            allowed = true; 
        }

        if (allowed) {
            existing.setCurrentStatus(newStatus);
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(currentUser);
            repository.save(existing);
        } else {
            throw new RuntimeException("Invalid status transition from " + current + " to " + newStatus);
        }
    }

    @Transactional
    public void deleteAssignment(Long id, String currentUser) {
        if (!"SYSTEM".equalsIgnoreCase(currentUser) && !authService.hasPermission(currentUser, "M2150", "write")) {
            throw new RuntimeException("Unauthorized: You do not have permission to delete induction assignments.");
        }

        InductionAssignment existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found."));

        if ("COMPLETED".equalsIgnoreCase(existing.getCurrentStatus())) {
            throw new RuntimeException("Completed inductions cannot be deleted.");
        }

        existing.setInductionStatus("IN ACTIVE");
        existing.setCurrentStatus("IN ACTIVE");
        existing.setUpdatedBy(currentUser);
        existing.setUpdatedAt(new Date());
        repository.save(existing);
    }

    public List<InductionAssignment> saveAll(List<InductionAssignment> entities, String currentUser) {
        for (InductionAssignment entity : entities) {
            save(entity, currentUser);
        }
        return entities;
    }

    public boolean isUsedInTraining(Long id) {
        List<?> trainingDetails = trainingDetailRepository.findByAssignmentId(id);
        return trainingDetails != null && !trainingDetails.isEmpty();
    }

    @Transactional
    public void delete(Long id) {
        InductionAssignment existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found."));
        
        List<?> trainingDetails = trainingDetailRepository.findByAssignmentId(id);
        if (trainingDetails != null && !trainingDetails.isEmpty()) {
            throw new RuntimeException("Cannot delete this induction assignment because it is already used in training records.");
        }
        
        repository.delete(existing);
    }
}
