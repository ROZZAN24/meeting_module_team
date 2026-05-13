package com.autonoma.erp.service;

import com.autonoma.erp.model.AuditCriteria;
import com.autonoma.erp.repository.AuditCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AuditCriteriaService {

    @Autowired
    private AuditCriteriaRepository auditCriteriaRepository;

    public List<AuditCriteria> getAll() {
        return auditCriteriaRepository.findAll();
    }

    public Optional<AuditCriteria> getById(Long id) {
        return auditCriteriaRepository.findById(id);
    }

    public AuditCriteria save(AuditCriteria criteria) {
        // SOP: Audit Criteria value should automatically convert to uppercase
        if (criteria.getCriteriaText() != null) {
            criteria.setCriteriaText(criteria.getCriteriaText().toUpperCase().trim());
        }

        if (criteria.getId() != null) {
            criteria.setUpdatedDate(new Date());
        } else {
            criteria.setCreatedDate(new Date());
            if (criteria.getStatus() == null) criteria.setStatus("ACTIVE");
        }
        return auditCriteriaRepository.save(criteria);
    }

    public void delete(Long id) {
        auditCriteriaRepository.deleteById(id);
    }

    public String generateNextSeqNo() {
        return auditCriteriaRepository.findFirstByOrderBySeqNoDesc()
                .map(latest -> incrementSequence(latest.getSeqNo(), "AC-"))
                .orElse("AC-001");
    }

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty()) return prefix + "001";
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest);
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = numericPart.length();
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()) + nextNum;
            }
            return prefix + "001";
        } catch (Exception e) {
            return prefix + "001";
        }
    }
}
