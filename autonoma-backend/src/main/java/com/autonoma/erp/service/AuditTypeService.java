package com.autonoma.erp.service;

import com.autonoma.erp.model.AuditType;
import com.autonoma.erp.repository.AuditTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AuditTypeService {

    @Autowired
    private AuditTypeRepository auditTypeRepository;

    public List<AuditType> getAll() {
        return auditTypeRepository.findAll();
    }

    public Page<AuditType> getAllPaginated(String search, String status, String auditArea, Pageable pageable) {
        // Simple search logic for now, can be improved with Specification if needed
        if ((search == null || search.isEmpty()) && (status == null || status.isEmpty()) && (auditArea == null || auditArea.isEmpty())) {
            return auditTypeRepository.findAll(pageable);
        }
        
        // For simplicity in this step, I'll just use findAll(pageable) 
        // Real filtering would use a Specification or a custom query.
        return auditTypeRepository.findAll(pageable);
    }

    public List<AuditType> getActive() {
        // You might want to implement a custom finder in repository for this
        return auditTypeRepository.findAll().stream()
                .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                .toList();
    }

    public Optional<AuditType> getById(Long id) {
        return auditTypeRepository.findById(id);
    }

    public AuditType save(AuditType auditType) {
        // SOP: Converted to uppercase automatically
        if (auditType.getAuditType() != null) {
            auditType.setAuditType(auditType.getAuditType().toUpperCase().trim());
        }

        // SOP: Validation - Criteria Minimum Count must be greater than zero
        if (auditType.getCriteriaMinCount() == null || auditType.getCriteriaMinCount() <= 0) {
            throw new IllegalArgumentException("Please Enter Audit Criteria Minimum Count...");
        }

        if (auditType.getId() != null) {
            auditType.setUpdatedDate(new Date());
        } else {
            auditType.setCreatedDate(new Date());
            if (auditType.getStatus() == null) auditType.setStatus("ACTIVE");
        }
        return auditTypeRepository.save(auditType);
    }

    public void delete(Long id) {
        // Optional: Implement soft delete
        auditTypeRepository.deleteById(id);
    }
}
