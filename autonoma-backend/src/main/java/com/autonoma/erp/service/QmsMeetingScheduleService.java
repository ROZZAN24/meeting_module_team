package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.QmsMeetingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QmsMeetingScheduleService {
    private final QmsMeetingScheduleRepository repository;
    private final NotificationService notificationService;

    public List<QmsMeetingSchedule> getAllSchedules() {
        return repository.findAll();
    }

    public QmsMeetingSchedule getScheduleById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Schedule not found"));
    }

    @Transactional
    public QmsMeetingSchedule saveSchedule(QmsMeetingSchedule schedule) {
        boolean isNew = schedule.getId() == null;
        QmsMeetingSchedule oldSchedule = null;

        if (!isNew) {
            oldSchedule = repository.findById(schedule.getId()).orElse(null);
        } else {
            schedule.setScheduleNo(generateScheduleNo(schedule));
        }
        
        // Ensure bidirectional links are set for participants and departments
        if (schedule.getDepartments() != null) {
            schedule.getDepartments().forEach(d -> d.setSchedule(schedule));
        }
        if (schedule.getParticipants() != null) {
            schedule.getParticipants().forEach(p -> p.setSchedule(schedule));
        }
        
        QmsMeetingSchedule saved = repository.save(schedule);

        // Determine Action Type
        boolean timeChanged = false;
        if (!isNew && oldSchedule != null) {
            boolean dateChanged = (saved.getMeetingDate() != null && !saved.getMeetingDate().equals(oldSchedule.getMeetingDate()));
            boolean startChanged = (saved.getStartTime() != null && !saved.getStartTime().equals(oldSchedule.getStartTime()));
            timeChanged = dateChanged || startChanged;
        }
        String actionType = isNew ? "NEW" : (timeChanged ? "UPDATE_TIME" : "UPDATE_MEMBERS");

        // Notify Host
        if (isNew || timeChanged || (!isNew && oldSchedule != null && oldSchedule.getHostBy() != null && saved.getHostBy() != null && !oldSchedule.getHostBy().getId().equals(saved.getHostBy().getId()))) {
             if (saved.getHostBy() != null) {
                 notificationService.notifyUserAboutMeeting(saved.getHostBy(), saved, actionType);
             }
        }

        // Notify Participants
        if (saved.getParticipants() != null) {
            List<Long> oldParticipantIds = java.util.Collections.emptyList();
            if (!isNew && oldSchedule != null && oldSchedule.getParticipants() != null) {
                oldParticipantIds = oldSchedule.getParticipants().stream()
                        .filter(p -> p.getEmployee() != null)
                        .map(p -> p.getEmployee().getId())
                        .collect(Collectors.toList());
            }
            
            for (QmsMeetingScheduleParticipant participant : saved.getParticipants()) {
                if (participant.getEmployee() != null) {
                    Long empId = participant.getEmployee().getId();
                    // If it's new, or time changed (notify all), or it's an update but this participant wasn't in the old list (notify new only)
                    if (isNew || timeChanged || !oldParticipantIds.contains(empId)) {
                        notificationService.notifyUserAboutMeeting(participant.getEmployee(), saved, actionType);
                    }
                }
            }
        }

        return saved;
    }

    @Transactional
    public void deleteSchedule(Long id) {
        repository.deleteById(id);
    }

    private String generateScheduleNo(QmsMeetingSchedule schedule) {
        String prefix = schedule.getMeetingType() != null ? schedule.getMeetingType().getMeetingPrefix() : "MEET";
        int year = LocalDate.now().getYear();
        String yearRange = year + "-" + (year + 1);
        Long nextId = repository.findMaxId().orElse(0L) + 1;
        return String.format("%s/%s/%d", prefix, yearRange, nextId);
    }
}
