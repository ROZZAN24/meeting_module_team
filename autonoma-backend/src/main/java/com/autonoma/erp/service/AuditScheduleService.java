package com.autonoma.erp.service;

import com.autonoma.erp.model.AuditSchedule;
import com.autonoma.erp.model.AuditScheduleCriteria;
import com.autonoma.erp.repository.AuditScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@org.springframework.transaction.annotation.Transactional
public class AuditScheduleService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuditScheduleService.class);

    @Autowired
    private AuditScheduleRepository repository;

    public List<AuditSchedule> getAllAuditSchedules() {
        return repository.findAll().stream().filter(a -> !a.isDeleted()).toList();
    }

    public Optional<AuditSchedule> getAuditScheduleById(Long id) {
        return repository.findById(id);
    }

    public AuditSchedule createAuditSchedule(AuditSchedule auditSchedule) {
        logger.debug("Creating Audit Schedule with {} criteria items", 
            auditSchedule.getCriteriaList() != null ? auditSchedule.getCriteriaList().size() : 0);
            
        validateEmployeeAvailability(auditSchedule, null);

        if (auditSchedule.getCriteriaList() != null) {
            for (AuditScheduleCriteria criteria : auditSchedule.getCriteriaList()) {
                criteria.setAuditSchedule(auditSchedule);
            }
        }
        return repository.save(auditSchedule);
    }

    public AuditSchedule updateAuditSchedule(Long id, AuditSchedule updatedAuditSchedule) {
        validateEmployeeAvailability(updatedAuditSchedule, id);
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
            existing.setCriteriaMinCount(updatedAuditSchedule.getCriteriaMinCount());
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

    private String extractEmployeeCode(String employeeField) {
        if (employeeField == null || employeeField.trim().isEmpty()) {
            return null;
        }
        int index = employeeField.lastIndexOf(" - ");
        if (index != -1) {
            return employeeField.substring(index + 3).trim();
        }
        return employeeField.trim();
    }

    private void validateEmployeeAvailability(AuditSchedule schedule, Long excludeId) {
        if (schedule.getStatus() != null && !"OPEN".equalsIgnoreCase(schedule.getStatus())) {
            return;
        }

        String auditeeCode = extractEmployeeCode(schedule.getAuditee());
        String auditorCode = extractEmployeeCode(schedule.getAuditor());

        List<AuditSchedule> activeSchedules = repository.findAll().stream()
            .filter(a -> !a.isDeleted() && "OPEN".equalsIgnoreCase(a.getStatus()))
            .filter(a -> excludeId == null || !a.getId().equals(excludeId))
            .toList();

        for (AuditSchedule active : activeSchedules) {
            String activeAuditeeCode = extractEmployeeCode(active.getAuditee());
            String activeAuditorCode = extractEmployeeCode(active.getAuditor());

            if (auditeeCode != null) {
                if (auditeeCode.equalsIgnoreCase(activeAuditeeCode)) {
                    throw new RuntimeException("Validation Error: Auditee " + schedule.getAuditee() + " is already assigned to open Audit " + active.getScheduleNo());
                }
                if (auditeeCode.equalsIgnoreCase(activeAuditorCode)) {
                    throw new RuntimeException("Validation Error: Auditee " + schedule.getAuditee() + " is already assigned as Auditor to open Audit " + active.getScheduleNo());
                }
            }

            if (auditorCode != null) {
                if (auditorCode.equalsIgnoreCase(activeAuditeeCode)) {
                    throw new RuntimeException("Validation Error: Auditor " + schedule.getAuditor() + " is already assigned as Auditee to open Audit " + active.getScheduleNo());
                }
                if (auditorCode.equalsIgnoreCase(activeAuditorCode)) {
                    throw new RuntimeException("Validation Error: Auditor " + schedule.getAuditor() + " is already assigned to open Audit " + active.getScheduleNo());
                }
            }
        }
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
                return latest.substring(0, matcher.start()).trim() + nextNum;
            }
            return prefix + "0001";
        } catch (Exception e) {
            return prefix + "0001";
        }
    }
}
