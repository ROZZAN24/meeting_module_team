package com.autonoma.erp.service;

import com.autonoma.erp.model.InductionMaster;
import com.autonoma.erp.repository.InductionMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InductionMasterService {

    @Autowired
    private InductionMasterRepository repository;

    @Autowired
    private com.autonoma.erp.repository.InductionTrainingDetailRepository trainingDetailRepository;

    public List<InductionMaster> getAll() {
        return repository.findAll();
    }

    public Optional<InductionMaster> getById(Long id) {
        return repository.findById(id);
    }

    public InductionMaster save(InductionMaster entity, String currentUser) {
        // Basic Validations
        if (entity.getInductionDetails() == null || entity.getInductionDetails().trim().isEmpty()) {
            throw new RuntimeException("Induction Details are mandatory.");
        }
        if (entity.getDepartmentCodes() == null || entity.getDepartmentCodes().trim().isEmpty()) {
            throw new RuntimeException("At least one Department must be selected.");
        }
        if (entity.getLevelCodes() == null || entity.getLevelCodes().trim().isEmpty()) {
            throw new RuntimeException("At least one Level must be selected.");
        }

        // Level selection rules validation
        List<String> selectedLevels = java.util.Arrays.stream(entity.getLevelCodes().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toList());
        if (selectedLevels.contains("L1") && selectedLevels.size() < 2) {
            throw new RuntimeException("Minimum 2 levels must be selected when Level L1 is chosen.");
        }
        if ((selectedLevels.contains("L6") || selectedLevels.contains("L7")) && selectedLevels.size() < 3) {
            throw new RuntimeException("Minimum 3 levels must be selected when Level L6 or L7 is chosen.");
        }

        // Duplicate Check (Same Details + Same Dept + Same Level)
        // Note: For multi-select, we should ideally normalize the codes string (sort them)
        List<InductionMaster> all = repository.findAll();
        for (InductionMaster existing : all) {
            // Only block if an ACTIVE duplicate exists (excluding the current record being edited)
            // Helper to normalize comma-separated strings for comparison
            java.util.function.Function<String, String> normalize = (s) -> {
                if (s == null) return "";
                return java.util.Arrays.stream(s.split(","))
                        .map(String::trim)
                        .filter(str -> !str.isEmpty())
                        .sorted()
                        .collect(java.util.stream.Collectors.joining(","));
            };

            if ("ACTIVE".equalsIgnoreCase(existing.getStatus()) &&
                existing.getInductionDetails().equalsIgnoreCase(entity.getInductionDetails()) &&
                normalize.apply(existing.getDepartmentCodes()).equals(normalize.apply(entity.getDepartmentCodes())) &&
                normalize.apply(existing.getLevelCodes()).equals(normalize.apply(entity.getLevelCodes()))) {
                
                if (entity.getId() == null || !entity.getId().equals(existing.getId())) {
                    throw new RuntimeException("An active Induction Criteria with these details already exists for the selected Department and Level.");
                }
            }
        }

        if (entity.getId() == null) {
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(currentUser);
            if (entity.getStatus() == null) {
                entity.setStatus("ACTIVE");
            }
        } else {
            InductionMaster existing = repository.findById(entity.getId())
                    .orElseThrow(() -> new RuntimeException("Induction Criteria not found."));
            entity.setCreatedAt(existing.getCreatedAt());
            entity.setCreatedBy(existing.getCreatedBy());
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(currentUser);
            if (entity.getStatus() == null) {
                entity.setStatus(existing.getStatus());
            }
        }

        return repository.save(entity);
    }

    public Long getNextSequence() {
        Long maxId = repository.findMaxId();
        return (maxId == null ? 0L : maxId) + 1;
    }

    public void delete(Long id) {
        InductionMaster existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Induction Criteria not found."));
        
        // Restrict deletion if induction already assigned/used in responses
        if (trainingDetailRepository.existsByInductionMasterId(id)) {
            throw new RuntimeException("Cannot delete this induction criteria because it is already assigned to trainees.");
        }
        
        repository.delete(existing);
    }
}
