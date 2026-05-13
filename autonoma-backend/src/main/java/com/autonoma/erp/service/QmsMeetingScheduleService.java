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

    public List<QmsMeetingSchedule> getAllSchedules() {
        return repository.findAll();
    }

    public QmsMeetingSchedule getScheduleById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Schedule not found"));
    }

    @Transactional
    public QmsMeetingSchedule saveSchedule(QmsMeetingSchedule schedule) {
        if (schedule.getId() == null) {
            schedule.setScheduleNo(generateScheduleNo(schedule));
        }
        
        // Ensure bidirectional links are set for participants and departments
        if (schedule.getDepartments() != null) {
            schedule.getDepartments().forEach(d -> d.setSchedule(schedule));
        }
        if (schedule.getParticipants() != null) {
            schedule.getParticipants().forEach(p -> p.setSchedule(schedule));
        }
        
        return repository.save(schedule);
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
