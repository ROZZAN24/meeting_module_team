package com.autonoma.erp.service;

import com.autonoma.erp.model.AuditSchedule;
import com.autonoma.erp.model.AuditScheduleCriteria;
import com.autonoma.erp.repository.AuditScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuditScheduleService {

    @Autowired
    private AuditScheduleRepository repository;

    public List<AuditSchedule> getAllAuditSchedules() {
        return repository.findAll().stream().filter(a -> !a.isDeleted()).toList();
    }

    public Optional<AuditSchedule> getAuditScheduleById(Long id) {
        return repository.findById(id);
    }

    public AuditSchedule createAuditSchedule(AuditSchedule auditSchedule) {
        if (auditSchedule.getCriteriaList() != null) {
            for (AuditScheduleCriteria criteria : auditSchedule.getCriteriaList()) {
                criteria.setAuditSchedule(auditSchedule);
            }
        }
        return repository.save(auditSchedule);
    }

    public AuditSchedule updateAuditSchedule(Long id, AuditSchedule updatedAuditSchedule) {
        return repository.findById(id).map(existing -> {
            existing.setScheduleDate(updatedAuditSchedule.getScheduleDate());
            existing.setStatus(updatedAuditSchedule.getStatus());
            existing.setAuditType(updatedAuditSchedule.getAuditType());
            existing.setItemCode(updatedAuditSchedule.getItemCode());
            existing.setAuditArea(updatedAuditSchedule.getAuditArea());
            existing.setAuditDate(updatedAuditSchedule.getAuditDate());
            existing.setAuditMonth(updatedAuditSchedule.getAuditMonth());
            existing.setStartTime(updatedAuditSchedule.getStartTime());
            existing.setEndTime(updatedAuditSchedule.getEndTime());
            existing.setDepartment(updatedAuditSchedule.getDepartment());
            existing.setAuditee(updatedAuditSchedule.getAuditee());
            existing.setAuditor(updatedAuditSchedule.getAuditor());
            existing.setNcrApprovedBy(updatedAuditSchedule.getNcrApprovedBy());
            existing.setUpdatedBy(updatedAuditSchedule.getUpdatedBy());

            existing.getCriteriaList().clear();
            if (updatedAuditSchedule.getCriteriaList() != null) {
                for (AuditScheduleCriteria criteria : updatedAuditSchedule.getCriteriaList()) {
                    criteria.setAuditSchedule(existing);
                    existing.getCriteriaList().add(criteria);
                }
            }
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Audit Schedule not found with id " + id));
    }

    public void deleteAuditSchedule(Long id) {
        repository.findById(id).ifPresent(existing -> {
            existing.setDeleted(true);
            repository.save(existing);
        });
    }

    public String getNextScheduleNo() {
        return repository.findFirstByOrderByScheduleNoDesc()
                .map(latest -> incrementSequence(latest.getScheduleNo(), "SCH-"))
                .orElse("SCH-0001");
    }

    private String incrementSequence(String latest, String prefix) {
        if (latest == null || latest.isEmpty()) return prefix + "0001";
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\d+$");
            java.util.regex.Matcher matcher = pattern.matcher(latest.trim());
            if (matcher.find()) {
                String numericPart = matcher.group();
                int num = Integer.parseInt(numericPart);
                int length = Math.max(numericPart.length(), 4);
                String nextNum = String.format("%0" + length + "d", num + 1);
                return latest.substring(0, matcher.start()).trim() + "-" + nextNum;
            }
            return prefix + "0001";
        } catch (Exception e) {
            return prefix + "0001";
        }
    }
}
