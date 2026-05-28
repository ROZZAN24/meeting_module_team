package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.QmsMomMasterRepository;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QmsMomMasterService {
    private final QmsMomMasterRepository repository;
    private final EmployeeMasterRepository employeeRepository;
    private final com.autonoma.erp.repository.QmsMomDetailRepository detailRepository;
    private final com.autonoma.erp.repository.QmsMeetingUserAttendanceRepository meetingUserAttendanceRepository;

    public List<QmsMomMaster> getAllMoms() {
        return repository.findAll();
    }

    public QmsMomMaster getMomById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("MOM not found"));
    }

    public List<com.autonoma.erp.dto.MomActionSummaryDTO> getAllActions() {
        return detailRepository.findAllActions().stream().map(d -> {
            com.autonoma.erp.dto.MomActionSummaryDTO dto = new com.autonoma.erp.dto.MomActionSummaryDTO();
            dto.setId(d.getId());
            dto.setMomId(d.getMom().getId());
            dto.setMomNo(d.getMom().getMomNo());
            dto.setMomDate(d.getMom().getMomDate());
            if (d.getMom().getSchedule() != null) {
                dto.setScheduleNo(d.getMom().getSchedule().getScheduleNo());
            }
            
            // To figure out meetNo and amendMeetNo, we ideally want to just rely on DB index if stored,
            // but currently they are transient on UI. Wait, are they stored?
            // Actually, looking at QmsMomDetail, meetNo is NOT stored!
            // It's calculated dynamically on UI. I'll just pass the ID and calculate on UI, 
            // but I'll add basic indexing logic if possible, or just leave meetNo empty here.
            dto.setDiscussedPoint(d.getDiscussedPoint());
            dto.setPointType(d.getPointType());
            dto.setMaterialList(d.getMaterialList());
            dto.setProcessType(d.getProcessType());
            dto.setAssignedBy(d.getAssignedBy() != null ? d.getAssignedBy().getEmployeeName() : null);
            dto.setAssignedTo(d.getAssignedTo() != null ? d.getAssignedTo().getEmployeeName() : null);
            dto.setTargetDate(d.getTargetDate());
            dto.setReviewDate(d.getReviewDate());
            dto.setAttachmentRequired(d.getAttachmentRequired());
            dto.setStatus(d.getStatus());
            dto.setActionTaken(d.getActionTaken());
            dto.setActionObservation(d.getActionObservation());
            dto.setCancelRemarks(d.getCancelRemarks());
            dto.setCreatedAt(d.getCreatedAt() != null ? d.getCreatedAt().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null);
            dto.setCreatedBy(d.getCreatedBy());
            return dto;
        }).toList();
    }

    @Transactional
    public QmsMomMaster saveMom(QmsMomMaster mom) {
        if (mom.getId() == null) {
            mom.setMomNo(generateMomNo(mom));
            if (mom.getDetails() != null) {
                mom.getDetails().forEach(detail -> {
                    detail.setMom(mom);
                    String prefix = "[" + mom.getMomNo() + "] ";
                    if (detail.getDiscussedPoint() != null && !detail.getDiscussedPoint().startsWith("[")) {
                        detail.setDiscussedPoint(prefix + detail.getDiscussedPoint());
                    }
                    if ("INFO".equalsIgnoreCase(detail.getProcessType())) {
                        detail.setStatus("CLOSED");
                    } else if ("ACTION".equalsIgnoreCase(detail.getProcessType())) {
                        detail.setStatus("OPEN");
                    }
                });
            }
            if (mom.getAttendanceList() != null) {
                mom.getAttendanceList().forEach(att -> att.setMom(mom));
            }
            QmsMomMaster saved = repository.save(mom);
            syncToMeetingUserAttendance(saved);
            return saved;
        } else {
            QmsMomMaster existing = repository.findById(mom.getId())
                    .orElseThrow(() -> new RuntimeException("MOM not found"));
            
            existing.setMomNo(mom.getMomNo());
            existing.setMomDate(mom.getMomDate());
            existing.setSchedule(mom.getSchedule());
            existing.setAgenda(mom.getAgenda());
            existing.setChairedBy(mom.getChairedBy());
            existing.setStartTime(mom.getStartTime());
            existing.setEndTime(mom.getEndTime());
            existing.setStatus(mom.getStatus());
            existing.setUpdatedUser(mom.getUpdatedUser());
            existing.setUpdatedDate(mom.getUpdatedDate());
            
            existing.getDetails().clear();
            if (mom.getDetails() != null) {
                for (QmsMomDetail d : mom.getDetails()) {
                    d.setMom(existing);
                    String prefix = "[" + existing.getMomNo() + "] ";
                    if (d.getDiscussedPoint() != null && !d.getDiscussedPoint().startsWith("[")) {
                        d.setDiscussedPoint(prefix + d.getDiscussedPoint());
                    }
                    if ("INFO".equalsIgnoreCase(d.getProcessType())) {
                        d.setStatus("CLOSED");
                    } else if ("ACTION".equalsIgnoreCase(d.getProcessType())) {
                        d.setStatus("OPEN");
                    }
                    existing.getDetails().add(d);
                }
            }
            
            existing.getAttendanceList().clear();
            if (mom.getAttendanceList() != null) {
                for (QmsMomAttendance att : mom.getAttendanceList()) {
                    att.setMom(existing);
                    existing.getAttendanceList().add(att);
                }
            }
            
            QmsMomMaster saved = repository.save(existing);
            syncToMeetingUserAttendance(saved);
            return saved;
        }
    }

    @Transactional
    public void updateAttendanceOutTimes(Long momId, List<Map<String, Object>> outTimes) {
        QmsMomMaster mom = getMomById(momId);
        if (mom.getAttendanceList() != null) {
            for (Map<String, Object> entry : outTimes) {
                Long empId = null;
                if (entry.get("employeeId") != null) {
                    empId = Long.parseLong(entry.get("employeeId").toString());
                }
                Long attId = null;
                if (entry.get("attendanceId") != null) {
                    attId = Long.parseLong(entry.get("attendanceId").toString());
                }
                String outTimeStr = (String) entry.get("outTime");
                
                for (QmsMomAttendance att : mom.getAttendanceList()) {
                    boolean matches = false;
                    if (attId != null && attId.equals(att.getId())) {
                        matches = true;
                    } else if (empId != null && att.getEmployee() != null && empId.equals(att.getEmployee().getId())) {
                        matches = true;
                    }
                    
                    if (matches) {
                        if (outTimeStr == null || outTimeStr.trim().isEmpty()) {
                            att.setOutTime(null);
                        } else {
                            att.setOutTime(java.time.LocalTime.parse(outTimeStr));
                        }
                    }
                }
            }
        }
        QmsMomMaster saved = repository.save(mom);
        syncToMeetingUserAttendance(saved);
    }

    private void syncToMeetingUserAttendance(QmsMomMaster mom) {
        if (mom == null || mom.getSchedule() == null || mom.getAttendanceList() == null) return;
        
        Long scheduleId = mom.getSchedule().getId();
        for (QmsMomAttendance momAtt : mom.getAttendanceList()) {
            if (momAtt.getEmployee() != null) {
                Long empId = momAtt.getEmployee().getId();
                java.util.Optional<QmsMeetingUserAttendance> userAttOpt = 
                    meetingUserAttendanceRepository.findByScheduleIdAndEmployeeId(scheduleId, empId);
                
                if (userAttOpt.isPresent()) {
                    QmsMeetingUserAttendance userAtt = userAttOpt.get();
                    userAtt.setOutTime(momAtt.getOutTime());
                    meetingUserAttendanceRepository.save(userAtt);
                } else if (momAtt.getInTime() != null) {
                    QmsMeetingUserAttendance userAtt = new QmsMeetingUserAttendance();
                    userAtt.setSchedule(mom.getSchedule());
                    userAtt.setEmployee(momAtt.getEmployee());
                    userAtt.setInTime(momAtt.getInTime());
                    userAtt.setOutTime(momAtt.getOutTime());
                    userAtt.setStatus(momAtt.getAttendanceStatus() != null ? momAtt.getAttendanceStatus() : "PRESENT");
                    meetingUserAttendanceRepository.save(userAtt);
                }
            }
        }
    }

    @Transactional
    public void deleteMom(Long id) {
        QmsMomMaster mom = getMomById(id);
        if ("CLOSED".equalsIgnoreCase(mom.getStatus())) {
            throw new RuntimeException("Closed MOM cannot be deleted");
        }
        repository.deleteById(id);
    }

    /**
     * Reassign selected detail items to new employee with new target date.
     */
    @Transactional
    public void reassignDetails(Map<String, Object> data) {
        @SuppressWarnings("unchecked")
        List<Number> detailIds = (List<Number>) data.get("detailIds");
        Long assignById = Long.parseLong(data.get("assignById").toString());
        Long assignToId = Long.parseLong(data.get("assignToId").toString());
        String targetDate = data.get("targetDate").toString();

        EmployeeMaster assignBy = employeeRepository.findById(assignById)
                .orElseThrow(() -> new RuntimeException("Assign By employee not found"));
        EmployeeMaster assignTo = employeeRepository.findById(assignToId)
                .orElseThrow(() -> new RuntimeException("Assign To employee not found"));

        // Find all MOMs containing these detail IDs
        List<QmsMomMaster> allMoms = repository.findAll();
        for (QmsMomMaster mom : allMoms) {
            if (mom.getDetails() != null) {
                mom.getDetails().forEach(detail -> {
                    if (detailIds.stream().anyMatch(dId -> dId.longValue() == detail.getId())) {
                        detail.setAssignedBy(assignBy);
                        detail.setAssignedTo(assignTo);
                        detail.setTargetDate(LocalDate.parse(targetDate));
                    }
                });
            }
            repository.save(mom);
        }
    }

    /**
     * Close a MOM detail (submit for approval).
     */
    @Transactional
    public void closeDetail(Long momId, Long detailId, Map<String, Object> data) {
        QmsMomMaster mom = getMomById(momId);
        QmsMomDetail detail = mom.getDetails().stream()
                .filter(d -> d.getId() != null && d.getId().longValue() == detailId.longValue())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Detail not found"));

        detail.setStatus("PENDING FOR APPROVAL");
        if (data.containsKey("actionTaken") && data.get("actionTaken") != null) {
            detail.setActionTaken(String.valueOf(data.get("actionTaken")));
        }
        if (data.containsKey("actionObservation") && data.get("actionObservation") != null) {
            detail.setActionObservation(String.valueOf(data.get("actionObservation")));
        }
        repository.save(mom);
    }

    /**
     * Approve a MOM detail.
     */
    @Transactional
    public void approveDetail(Long momId, Long detailId) {
        QmsMomMaster mom = getMomById(momId);
        QmsMomDetail detail = mom.getDetails().stream()
                .filter(d -> d.getId() != null && d.getId().longValue() == detailId.longValue())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Detail not found"));

        detail.setStatus("CLOSED");

        // Check if all ACTION details are CLOSED -> close the parent MOM
        boolean allClosed = mom.getDetails().stream()
                .filter(d -> "ACTION".equalsIgnoreCase(d.getProcessType()))
                .allMatch(d -> "CLOSED".equalsIgnoreCase(d.getStatus()));
        if (allClosed) {
            mom.setStatus("CLOSED");
        }
        repository.save(mom);
    }

    /**
     * Reject a MOM detail with comments.
     */
    @Transactional
    public void rejectDetail(Long momId, Long detailId, String comments) {
        QmsMomMaster mom = getMomById(momId);
        QmsMomDetail detail = mom.getDetails().stream()
                .filter(d -> d.getId() != null && d.getId().longValue() == detailId.longValue())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Detail not found"));

        detail.setStatus("REJECTED");
        detail.setCancelRemarks(comments);
        repository.save(mom);
    }

    private String generateMomNo(QmsMomMaster mom) {
        String typePrefix = "MEET";
        if (mom.getSchedule() != null && mom.getSchedule().getMeetingType() != null) {
            typePrefix = mom.getSchedule().getMeetingType().getMeetingPrefix();
        }
        int year = LocalDate.now().getYear();
        String yearRange = year + "-" + (year + 1);
        Long nextId = repository.findMaxId().orElse(0L) + 1;
        return String.format("MM/%s/%s/%03d", typePrefix, yearRange, nextId);
    }
}
