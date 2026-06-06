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

    @Autowired
    private com.autonoma.erp.repository.AuditAttendanceRepository auditAttendanceRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.AppPreferenceRepository appPreferenceRepository;

    @Autowired
    private com.autonoma.erp.repository.AuditObservationRepository auditObservationRepository;

    @Autowired
    private com.autonoma.erp.repository.EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private com.autonoma.erp.service.NotificationService notificationService;

    private void sendAuditNotifications(AuditSchedule schedule, String actionType) {
        try {
            logger.info("Sending notifications for Audit Schedule: {}, action: {}", schedule.getScheduleNo(), actionType);
            String auditeeCode = extractEmployeeCode(schedule.getAuditee());
            String auditorCode = extractEmployeeCode(schedule.getAuditor());

            java.util.Set<String> recipientCodes = new java.util.HashSet<>();
            if (auditeeCode != null && !auditeeCode.trim().isEmpty()) {
                recipientCodes.add(auditeeCode.trim().toLowerCase());
            }
            if (auditorCode != null && !auditorCode.trim().isEmpty()) {
                recipientCodes.add(auditorCode.trim().toLowerCase());
            }

            for (String code : recipientCodes) {
                employeeMasterRepository.findByEmpCode(code).ifPresent(emp -> {
                    notificationService.notifyUserAboutAudit(emp, schedule, actionType);
                });
            }
        } catch (Exception e) {
            logger.error("Failed to send audit notifications for schedule {}: {}", schedule.getScheduleNo(), e.getMessage(), e);
        }
    }

    public List<AuditSchedule> getAllAuditSchedules() {
        List<AuditSchedule> list = repository.findAll().stream().filter(a -> !a.isDeleted()).toList();
        for (AuditSchedule schedule : list) {
            boolean exists = !auditAttendanceRepository.findByAuditScheduleNo(schedule.getScheduleNo()).isEmpty();
            schedule.setHasAttendance(exists);

            // Auto-heal schedule status in memory only if observation already exists in DB (e.g. from seed scripts)
            boolean hasObservation = auditObservationRepository.existsByAuditScheduleNoIgnoreCase(schedule.getScheduleNo());
            if (hasObservation && !"CLOSED".equalsIgnoreCase(schedule.getStatus())) {
                schedule.setStatus("CLOSED");
            }
        }
        return list;
    }

    public Optional<AuditSchedule> getAuditScheduleById(Long id) {
        return repository.findById(id).map(schedule -> {
            boolean exists = !auditAttendanceRepository.findByAuditScheduleNo(schedule.getScheduleNo()).isEmpty();
            schedule.setHasAttendance(exists);

            // Auto-heal schedule status in memory only if observation already exists in DB
            boolean hasObservation = auditObservationRepository.existsByAuditScheduleNoIgnoreCase(schedule.getScheduleNo());
            if (hasObservation && !"CLOSED".equalsIgnoreCase(schedule.getStatus())) {
                schedule.setStatus("CLOSED");
            }
            return schedule;
        });
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
        AuditSchedule saved = repository.save(auditSchedule);
        sendAuditNotifications(saved, "CREATE");
        return saved;
    }

    public AuditSchedule updateAuditSchedule(Long id, AuditSchedule updatedAuditSchedule) {
        validateEmployeeAvailability(updatedAuditSchedule, id);
        return repository.findById(id).map(existing -> {
            // Check if there is any attendance put for this schedule
            boolean exists = !auditAttendanceRepository.findByAuditScheduleNo(existing.getScheduleNo()).isEmpty();
            if (exists) {
                throw new RuntimeException("Cannot reschedule or edit this audit schedule because employee attendance has already been recorded.");
            }

            boolean dateOrTimeChanged = false;
            if (existing.getAuditDate() != null && updatedAuditSchedule.getAuditDate() != null 
                    && !existing.getAuditDate().equals(updatedAuditSchedule.getAuditDate())) {
                dateOrTimeChanged = true;
            }
            if (existing.getStartTime() != null && updatedAuditSchedule.getStartTime() != null 
                    && !existing.getStartTime().equals(updatedAuditSchedule.getStartTime())) {
                dateOrTimeChanged = true;
            }
            if (existing.getEndTime() != null && updatedAuditSchedule.getEndTime() != null 
                    && !existing.getEndTime().equals(updatedAuditSchedule.getEndTime())) {
                dateOrTimeChanged = true;
            }

            boolean assigneeChanged = false;
            if (existing.getAuditee() != null && updatedAuditSchedule.getAuditee() != null 
                    && !existing.getAuditee().equals(updatedAuditSchedule.getAuditee())) {
                assigneeChanged = true;
            }
            if (existing.getAuditor() != null && updatedAuditSchedule.getAuditor() != null 
                    && !existing.getAuditor().equals(updatedAuditSchedule.getAuditor())) {
                assigneeChanged = true;
            }

            // Increment reschedule count if the audit date is changed
            if (existing.getAuditDate() != null && updatedAuditSchedule.getAuditDate() != null 
                    && !existing.getAuditDate().equals(updatedAuditSchedule.getAuditDate())) {
                int currentCount = existing.getRescheduleCount() != null ? existing.getRescheduleCount() : 0;
                existing.setRescheduleCount(currentCount + 1);
            }

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
            AuditSchedule saved = repository.save(existing);

            String actionType = "UPDATE";
            if (dateOrTimeChanged) {
                actionType = "RESCHEDULE";
            } else if (assigneeChanged) {
                actionType = "ASSIGN";
            }
            sendAuditNotifications(saved, actionType);

            return saved;
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
        String ncrCode = extractEmployeeCode(schedule.getNcrApprovedBy());

        List<String> employeeCodes = new java.util.ArrayList<>();
        if (auditeeCode != null && !auditeeCode.trim().isEmpty()) {
            employeeCodes.add(auditeeCode.trim().toLowerCase());
        }
        if (auditorCode != null && !auditorCode.trim().isEmpty()) {
            employeeCodes.add(auditorCode.trim().toLowerCase());
        }
        if (ncrCode != null && !ncrCode.trim().isEmpty()) {
            employeeCodes.add(ncrCode.trim().toLowerCase());
        }

        if (employeeCodes.isEmpty()) {
            return;
        }

        List<AuditSchedule> activeSchedules = repository.findAll().stream()
            .filter(a -> !a.isDeleted() && "OPEN".equalsIgnoreCase(a.getStatus()))
            .filter(a -> excludeId == null || !a.getId().equals(excludeId))
            .toList();

        for (AuditSchedule active : activeSchedules) {
            // Check if same date
            if (!isSameDate(schedule.getAuditDate(), active.getAuditDate())) {
                continue;
            }

            // Check if overlapping time
            if (!isTimeOverlapping(schedule.getStartTime(), schedule.getEndTime(), active.getStartTime(), active.getEndTime())) {
                continue;
            }

            String activeAuditee = extractEmployeeCode(active.getAuditee());
            String activeAuditor = extractEmployeeCode(active.getAuditor());
            String activeNcr = extractEmployeeCode(active.getNcrApprovedBy());

            List<String> activeEmployeeCodes = new java.util.ArrayList<>();
            if (activeAuditee != null && !activeAuditee.trim().isEmpty()) {
                activeEmployeeCodes.add(activeAuditee.trim().toLowerCase());
            }
            if (activeAuditor != null && !activeAuditor.trim().isEmpty()) {
                activeEmployeeCodes.add(activeAuditor.trim().toLowerCase());
            }
            if (activeNcr != null && !activeNcr.trim().isEmpty()) {
                activeEmployeeCodes.add(activeNcr.trim().toLowerCase());
            }

            for (String code : employeeCodes) {
                if (activeEmployeeCodes.contains(code)) {
                    String empName = "";
                    if (code.equalsIgnoreCase(auditeeCode)) {
                        empName = schedule.getAuditee();
                    } else if (code.equalsIgnoreCase(auditorCode)) {
                        empName = schedule.getAuditor();
                    } else if (code.equalsIgnoreCase(ncrCode)) {
                        empName = schedule.getNcrApprovedBy();
                    }

                    if (empName != null && empName.contains(" - ")) {
                        empName = empName.split(" - ")[0].trim();
                    }

                    throw new RuntimeException("Validation Error: Employee \"" + empName + "\" is already allocated to Audit " + active.getScheduleNo() + " at the same time (" + active.getStartTime() + " - " + active.getEndTime() + ").");
                }
            }
        }
    }

    private boolean isSameDate(java.util.Date d1, java.util.Date d2) {
        if (d1 == null || d2 == null) return false;
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(d1).equals(sdf.format(d2));
    }

    private int convertTimeToMinutes(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            return 0;
        }
        try {
            String[] parts = timeStr.trim().split("\\s+");
            if (parts.length < 2) return 0;
            String[] timeParts = parts[0].split(":");
            int hours = Integer.parseInt(timeParts[0]);
            int minutes = timeParts.length > 1 ? Integer.parseInt(timeParts[1]) : 0;
            String ampm = parts[1].toUpperCase();

            if ("PM".equals(ampm) && hours != 12) {
                hours += 12;
            } else if ("AM".equals(ampm) && hours == 12) {
                hours = 0;
            }
            return hours * 60 + minutes;
        } catch (Exception e) {
            return 0;
        }
    }

    private boolean isTimeOverlapping(String start1, String end1, String start2, String end2) {
        int s1 = convertTimeToMinutes(start1);
        int e1 = convertTimeToMinutes(end1);
        int s2 = convertTimeToMinutes(start2);
        int e2 = convertTimeToMinutes(end2);
        return s1 < e2 && s2 < e1;
    }

    public void deleteAuditSchedule(Long id) {
        repository.findById(id).ifPresent(existing -> {
            // Check if there is any attendance put for this schedule
            boolean exists = !auditAttendanceRepository.findByAuditScheduleNo(existing.getScheduleNo()).isEmpty();
            if (exists) {
                throw new RuntimeException("Cannot delete this audit schedule because employee attendance has already been recorded.");
            }
            existing.setDeleted(true);
            AuditSchedule saved = repository.save(existing);
            sendAuditNotifications(saved, "CANCEL");
        });
    }

    public String getNextScheduleNo() {
        String prefix = appPreferenceRepository.findByPrefName("SCHEDULE_PREFIX")
                .map(com.autonoma.erp.model.admin.AppPreference::getPrefValue)
                .orElse("SCH-");
        return repository.findFirstByOrderByScheduleNoDesc()
                .map(latest -> incrementSequence(latest.getScheduleNo(), prefix))
                .orElse(prefix + "0001");
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
