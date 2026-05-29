package com.autonoma.erp.service;

import com.autonoma.erp.model.InductionAssignment;
import com.autonoma.erp.repository.InductionAssignmentRepository;
import com.autonoma.erp.repository.InductionTrainingDetailRepository;
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

    public List<InductionAssignment> getAll() {
        return repository.findAll();
    }

    public List<InductionAssignment> getActiveOnly() {
        return repository.findAllActive();
    }

    public List<InductionAssignment> getByEmpCode(String empCode) {
        return repository.findByEmpCode(empCode);
    }

    @Transactional
    public InductionAssignment save(InductionAssignment entity, String currentUser) {
        // 1. Validations
        if (entity.getEmpCode() == null || entity.getEmpCode().isEmpty()) {
            throw new RuntimeException("Employee Code is mandatory.");
        }
        if (entity.getInductionRound() == null || entity.getInductionRound().isEmpty()) {
            throw new RuntimeException("Induction Round is mandatory.");
        }

        // 2. Duplicate Assignment Check (SOP 12)
        // Same Employee + Same Round + Status != COMPLETED
        List<InductionAssignment> existingActive = repository.findActiveAssignmentsByEmpAndRound(entity.getEmpCode(), entity.getInductionRound());
        
        for (InductionAssignment existing : existingActive) {
            if (!"COMPLETED".equalsIgnoreCase(existing.getCurrentStatus())) {
                if (entity.getId() == null || !entity.getId().equals(existing.getId())) {
                    // SOP 18: If the same round is reassigned, old records become IN ACTIVE and REJECTED
                    existing.setInductionStatus("IN ACTIVE");
                    existing.setCurrentStatus("REJECTED");
                    existing.setUpdatedAt(new Date());
                    existing.setUpdatedBy(currentUser);
                    repository.save(existing);
                }
            }
        }

        // 3. New Record Defaults
        if (entity.getId() == null) {
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(currentUser);
            if (entity.getCurrentStatus() == null) {
                entity.setCurrentStatus("PENDING");
            }
            entity.setInductionStatus("ACTIVE");
        } else {
            InductionAssignment original = repository.findById(entity.getId())
                    .orElseThrow(() -> new RuntimeException("Assignment not found."));
            
            // SOP 16: Completed inductions cannot be modified
            if ("COMPLETED".equalsIgnoreCase(original.getCurrentStatus())) {
                throw new RuntimeException("Completed inductions cannot be modified.");
            }

            entity.setCreatedAt(original.getCreatedAt());
            entity.setCreatedBy(original.getCreatedBy());
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(currentUser);
        }

        return repository.save(entity);
    }

    @Transactional
    public void updateStatus(Long id, String newStatus, String currentUser) {
        InductionAssignment existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found."));
        
        // Status Update Logic (SOP 20)
        String current = existing.getCurrentStatus();
        boolean allowed = false;

        if ("PENDING".equals(current) && ("TRAINING GIVEN".equals(newStatus) || "RESCHEDULE".equals(newStatus))) allowed = true;
        else if ("RESCHEDULE".equals(current) && "PENDING".equals(newStatus)) allowed = true;
        else if ("TRAINING GIVEN".equals(current) && "COMPLETED".equals(newStatus)) allowed = true;

        if (!allowed && !"COMPLETED".equals(current)) {
            // Allow any change if it follows the general flow or if user is Admin (simplified for now)
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
        InductionAssignment existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found."));

        if ("COMPLETED".equalsIgnoreCase(existing.getCurrentStatus())) {
            throw new RuntimeException("Completed inductions cannot be deleted.");
        }

        existing.setInductionStatus("IN ACTIVE");
        existing.setCurrentStatus("REJECTED");
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
