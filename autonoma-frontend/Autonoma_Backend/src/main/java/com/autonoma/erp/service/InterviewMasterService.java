package com.autonoma.erp.service;

import com.autonoma.erp.model.InterviewMaster;
import com.autonoma.erp.repository.InterviewMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class InterviewMasterService {

    @Autowired
    private InterviewMasterRepository repository;

    public List<InterviewMaster> getAll() {
        return repository.findAll();
    }

    public Optional<InterviewMaster> getById(Long id) {
        if (id == null) return Optional.empty();
        return repository.findById(id);
    }

    public InterviewMaster save(InterviewMaster entity, String currentUser) {
        // Basic Validations
        if (entity.getCriteriaDetails() == null || entity.getCriteriaDetails().trim().isEmpty()) {
            throw new RuntimeException("Criteria Details are mandatory.");
        }
        if (entity.getCriteriaDetails().length() > 300) {
            throw new RuntimeException("Criteria Details must not exceed 300 characters.");
        }
        if (entity.getAnswer() == null || entity.getAnswer().trim().isEmpty()) {
            throw new RuntimeException("Answer is mandatory.");
        }
        if (entity.getDepartmentCodes() == null || entity.getDepartmentCodes().trim().isEmpty()) {
            throw new RuntimeException("At least one Department must be selected.");
        }
        if (entity.getLevelCodes() == null || entity.getLevelCodes().trim().isEmpty()) {
            throw new RuntimeException("At least one Level must be selected.");
        }
        if (entity.getInterviewRound() == null || entity.getInterviewRound().trim().isEmpty()) {
            throw new RuntimeException("Interview Round is mandatory.");
        }

        // Duplicate Check (Same Details + Same Dept + Same Level + Same Round)
        List<InterviewMaster> all = repository.findAll();
        for (InterviewMaster existing : all) {
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
                existing.getCriteriaDetails().equalsIgnoreCase(entity.getCriteriaDetails()) &&
                existing.getInterviewRound().equalsIgnoreCase(entity.getInterviewRound()) &&
                normalize.apply(existing.getDepartmentCodes()).equals(normalize.apply(entity.getDepartmentCodes())) &&
                normalize.apply(existing.getLevelCodes()).equals(normalize.apply(entity.getLevelCodes()))) {
                
                if (entity.getId() == null || !entity.getId().equals(existing.getId())) {
                    throw new RuntimeException("An active Interview Criteria with these details already exists for the selected Department, Level, and Round.");
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
            Long entityId = entity.getId();
            if (entityId == null) {
                throw new RuntimeException("ID is mandatory for update.");
            }
            InterviewMaster existing = repository.findById(entityId)
                    .orElseThrow(() -> new RuntimeException("Interview Criteria not found."));
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
        if (id == null) {
            throw new RuntimeException("ID is mandatory for delete.");
        }
        repository.deleteById(id);
    }
}
