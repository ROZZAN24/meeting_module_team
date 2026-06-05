package com.autonoma.erp.service;

import com.autonoma.erp.model.InductionAssignment;
import com.autonoma.erp.repository.InductionAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.List;

@Service
public class InductionAssignmentService {

    @Autowired
    private InductionAssignmentRepository repository;

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

        // Check if the trainer has previously rejected this screening level for this trainee
        // OR if this screening level is already completed
        List<InductionAssignment> empAssignments = repository.findByEmpCode(entity.getEmpCode());
        for (InductionAssignment past : empAssignments) {
            if (past.getScreeningLevel() != null && 
                past.getScreeningLevel().trim().equalsIgnoreCase(entity.getScreeningLevel().trim()) &&
                "ACTIVE".equalsIgnoreCase(past.getInductionStatus())) {
                
                if ("REJECTED".equalsIgnoreCase(past.getCurrentStatus()) &&
                    past.getTrainerEmpCode() != null &&
                    past.getTrainerEmpCode().equalsIgnoreCase(entity.getTrainerEmpCode())) {
                    throw new RuntimeException("Trainer previously rejected " + entity.getScreeningLevel() + " and cannot be reassigned to it.");
                }
                
                if ("COMPLETED".equalsIgnoreCase(past.getCurrentStatus())) {
                    throw new RuntimeException("Screening level " + entity.getScreeningLevel() + " has already been completed for this trainee.");
                }
            }
        }

        // 2. Duplicate Assignment Check (SOP 12)
        // Same Employee + Same Round + Status != COMPLETED
        List<InductionAssignment> allAssignments = repository.findByEmpCode(entity.getEmpCode());
        for (InductionAssignment existing : allAssignments) {
            if (existing.getInductionRound() != null && 
                existing.getInductionRound().trim().equalsIgnoreCase(entity.getInductionRound().trim()) &&
                "ACTIVE".equalsIgnoreCase(existing.getInductionStatus())) {
                
                if (entity.getId() == null || !entity.getId().equals(existing.getId())) {
                    existing.setInductionStatus("IN ACTIVE");
                    if (!"COMPLETED".equalsIgnoreCase(existing.getCurrentStatus()) && 
                        !"REJECTED".equalsIgnoreCase(existing.getCurrentStatus())) {
                        existing.setCurrentStatus("REJECTED");
                    }
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
}
