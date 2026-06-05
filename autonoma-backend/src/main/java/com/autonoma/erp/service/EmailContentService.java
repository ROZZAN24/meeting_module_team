package com.autonoma.erp.service;

import com.autonoma.erp.model.EmailContent;
import com.autonoma.erp.repository.EmailContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EmailContentService {

    @Autowired
    private EmailContentRepository repository;

    public List<EmailContent> getAll() {
        return repository.findAll();
    }

    public Optional<EmailContent> getById(Long id) {
        if (id == null) return Optional.empty();
        return repository.findById(id);
    }

    public EmailContent save(EmailContent entity, String currentUser) {
        // Validation
        if (entity.getType() == null || entity.getType().trim().isEmpty()) {
            throw new RuntimeException("Type is mandatory.");
        }
        if (entity.getSubject() == null || entity.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is mandatory.");
        }
        if (entity.getBodyContent() == null || entity.getBodyContent().trim().isEmpty()) {
            throw new RuntimeException("Body/Content is mandatory.");
        }
        if (entity.getYoursWindfully() == null || entity.getYoursWindfully().trim().isEmpty()) {
            throw new RuntimeException("Yours Windfully is mandatory.");
        }

        // Standardize status for checking
        if (entity.getId() == null && entity.getStatus() == null) {
            entity.setStatus("ACTIVE");
        }

        // Apply rules for active status:
        // When a new record is created duplicately(type) the previous record(original record) should become inactive on its own
        if ("ACTIVE".equalsIgnoreCase(entity.getStatus()) || Boolean.TRUE.equals(entity.getIsActive())) {
            List<EmailContent> allOthers = repository.findAll();
            for (EmailContent other : allOthers) {
                if (other.getType() != null && other.getType().trim().equalsIgnoreCase(entity.getType().trim())) {
                    if (entity.getId() == null || !other.getId().equals(entity.getId())) {
                        if ("ACTIVE".equalsIgnoreCase(other.getStatus()) || Boolean.TRUE.equals(other.getIsActive())) {
                            other.setStatus("INACTIVE");
                            other.setIsActive(false);
                            repository.save(other);
                        }
                    }
                }
            }
        }

        if (entity.getId() == null) {
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(currentUser);
            if (entity.getStatus() == null) {
                entity.setStatus("ACTIVE");
            }
            if (entity.getIsActive() == null) {
                entity.setIsActive(true);
            }
        } else {
            Long entityId = entity.getId();
            if (entityId == null) {
                throw new RuntimeException("ID is mandatory for update.");
            }
            EmailContent existing = repository.findById(entityId)
                    .orElseThrow(() -> new RuntimeException("Email Content not found."));
            entity.setCreatedAt(existing.getCreatedAt());
            entity.setCreatedBy(existing.getCreatedBy());
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(currentUser);
            if (entity.getStatus() == null) {
                entity.setStatus(existing.getStatus());
            }
            if (entity.getIsActive() == null) {
                entity.setIsActive(existing.getIsActive());
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
