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
                .map(latest -> {
                    String lastNo = latest.getScheduleNo();
                    try {
                        int num = Integer.parseInt(lastNo.replace("SCH-", ""));
                        return String.format("SCH-%04d", num + 1);
                    } catch (Exception e) {
                        return "SCH-0001";
                    }
                })
                .orElse("SCH-0001");
    }
}
