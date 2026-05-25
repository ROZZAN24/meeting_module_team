package com.autonoma.erp.service;

import com.autonoma.erp.model.VerificationCriteria;
import com.autonoma.erp.repository.VerificationCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class VerificationCriteriaService {

    @Autowired
    private VerificationCriteriaRepository repository;

    public List<VerificationCriteria> getAll() {
        return repository.findAll();
    }

    public Optional<VerificationCriteria> getById(Long id) {
        if (id == null) return Optional.empty();
        return repository.findById(id);
    }

    public VerificationCriteria save(VerificationCriteria entity, String currentUser) {
        // Validation
        if (entity.getType() == null || entity.getType().trim().isEmpty()) {
            throw new RuntimeException("Type is mandatory.");
        }
        if (entity.getDescription() == null || entity.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is mandatory.");
        }
        if (entity.getStatus() == null || entity.getStatus().trim().isEmpty()) {
            throw new RuntimeException("Status is mandatory.");
        }

        if (entity.getId() == null) {
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(currentUser);
        } else {
            Long entityId = entity.getId();
            if (entityId == null) {
                throw new RuntimeException("ID is mandatory for update.");
            }
            VerificationCriteria existing = repository.findById(entityId)
                    .orElseThrow(() -> new RuntimeException("Verification Criteria not found."));
            entity.setCreatedAt(existing.getCreatedAt());
            entity.setCreatedBy(existing.getCreatedBy());
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(currentUser);
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
