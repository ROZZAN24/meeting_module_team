package com.autonoma.erp.service;

import com.autonoma.erp.model.QmsMeetingSchedule;
import com.autonoma.erp.model.QmsMomMaster;
import com.autonoma.erp.model.QmsMomDetail;
import com.autonoma.erp.repository.QmsMeetingScheduleRepository;
import com.autonoma.erp.repository.QmsMomMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Meeting Scheduler Service — Runs daily at 04:00 AM IST.
 * 
 * Responsibilities:
 * 1. Auto-close expired OPEN meeting schedules (past end time)
 * 2. Mark overdue MOM ACTION items where target date has passed
 * 3. Generate recurrence schedules for DAILY/WEEKLY meetings
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MeetingSchedulerService {
    private final QmsMeetingScheduleRepository scheduleRepository;
    private final QmsMomMasterRepository momRepository;

    /**
     * Daily job at 4:00 AM IST.
     * Cron: second minute hour dayOfMonth month dayOfWeek
     */
    @Scheduled(cron = "0 0 4 * * ?", zone = "Asia/Kolkata")
    @Transactional
    public void dailyMeetingMaintenance() {
        log.info("===== Meeting Scheduler START — {} =====", LocalDate.now());
        autoCloseExpiredSchedules();
        markOverdueMomActions();
        generateRecurringMeetings(); // Added recurrence logic
        log.info("===== Meeting Scheduler END =====");
    }

    /**
     * 3. Generate recurring meetings for DAILY/WEEKLY schedules.
     *    Checks for active schedules with frequency and creates next occurrence if needed.
     */
    private void generateRecurringMeetings() {
        LocalDate today = LocalDate.now();
        List<QmsMeetingSchedule> baseSchedules = scheduleRepository.findAll();
        int generated = 0;

        for (QmsMeetingSchedule base : baseSchedules) {
            String freq = base.getFrequency();
            if (freq == null || "NONE".equalsIgnoreCase(freq)) continue;
            
            // Only generate from the original "Source" or most recent "Open" recurrence
            if (!"OPEN".equalsIgnoreCase(base.getStatus())) continue;

            LocalDate nextDate = null;
            if ("DAILY".equalsIgnoreCase(freq)) {
                nextDate = today.plusDays(1);
            } else if ("WEEKLY".equalsIgnoreCase(freq) && base.getWeekdays() != null) {
                // For weekly, we check the weekdays string (e.g. "Monday,Wednesday")
                String[] days = base.getWeekdays().split(",");
                for (int i = 1; i <= 7; i++) {
                    LocalDate candidate = today.plusDays(i);
                    String dayName = candidate.getDayOfWeek().name(); // MONDAY, TUESDAY...
                    for (String d : days) {
                        if (d.trim().equalsIgnoreCase(dayName)) {
                            nextDate = candidate;
                            break;
                        }
                    }
                    if (nextDate != null) break;
                }
            }

            if (nextDate != null) {
                // Check if already exists to prevent duplicates
                final LocalDate finalNextDate = nextDate;
                String sourceNo = base.getRevSourceScheduleNo() != null ? base.getRevSourceScheduleNo() : base.getScheduleNo();
                boolean exists = scheduleRepository.findAll().stream().anyMatch(s -> 
                    sourceNo.equals(s.getRevSourceScheduleNo()) && finalNextDate.equals(s.getMeetingDate())
                );

                if (!exists) {
                    QmsMeetingSchedule next = new QmsMeetingSchedule();
                    // Copy fields
                    next.setMeetingType(base.getMeetingType());
                    next.setMeetingName(base.getMeetingName());
                    next.setSubject(base.getSubject());
                    next.setDescription(base.getDescription());
                    next.setAgenda(base.getAgenda());
                    next.setStartTime(base.getStartTime());
                    next.setEndTime(base.getEndTime());
                    next.setIntervalTime(base.getIntervalTime());
                    next.setFrequency(base.getFrequency());
                    next.setWeekdays(base.getWeekdays());
                    next.setChairedBy(base.getChairedBy());
                    next.setHostBy(base.getHostBy());
                    
                    next.setMeetingDate(nextDate);
                    next.setRevSourceScheduleNo(sourceNo);
                    next.setRevNo(base.getRevNo() + 1);
                    next.setScheduleNo(sourceNo + "-R" + next.getRevNo());
                    next.setStatus("OPEN");
                    next.setCreatedBy("SYSTEM_SCHEDULER");

                    scheduleRepository.save(next);
                    generated++;
                    log.info("Generated recurring meeting: {} for date: {}", next.getScheduleNo(), nextDate);
                }
            }
        }
        log.info("Generated {} recurring meetings", generated);
    }

    /**
     * 1. Auto-close meeting schedules where:
     *    - Status is OPEN
     *    - Meeting date is before today (or today but past end time)
     */
    private void autoCloseExpiredSchedules() {
        List<QmsMeetingSchedule> allSchedules = scheduleRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        int closed = 0;

        for (QmsMeetingSchedule schedule : allSchedules) {
            if (!"OPEN".equalsIgnoreCase(schedule.getStatus())) continue;

            boolean expired = false;
            if (schedule.getMeetingDate() != null) {
                if (schedule.getMeetingDate().isBefore(today)) {
                    expired = true;
                } else if (schedule.getMeetingDate().isEqual(today) && schedule.getEndTime() != null) {
                    expired = schedule.getEndTime().isBefore(now);
                }
            }

            if (expired) {
                schedule.setStatus("AUTO CLOSED");
                scheduleRepository.save(schedule);
                closed++;
                log.info("Auto-closed schedule: {} (date: {})", schedule.getScheduleNo(), schedule.getMeetingDate());
            }
        }
        log.info("Auto-closed {} expired schedules", closed);
    }

    /**
     * 2. Mark overdue MOM action items where:
     *    - Process type is ACTION
     *    - Status is OPEN
     *    - Target date is before today
     */
    private void markOverdueMomActions() {
        List<QmsMomMaster> allMoms = momRepository.findAll();
        LocalDate today = LocalDate.now();
        int overdue = 0;

        for (QmsMomMaster mom : allMoms) {
            if (mom.getDetails() == null) continue;
            boolean modified = false;

            for (QmsMomDetail detail : mom.getDetails()) {
                if ("ACTION".equalsIgnoreCase(detail.getProcessType())
                    && "OPEN".equalsIgnoreCase(detail.getStatus())
                    && detail.getTargetDate() != null
                    && detail.getTargetDate().isBefore(today)) {
                    detail.setStatus("OVERDUE");
                    overdue++;
                    modified = true;
                    log.info("Marked overdue: MOM {} detail {} (target: {})",
                            mom.getMomNo(), detail.getId(), detail.getTargetDate());
                }
            }

            if (modified) {
                momRepository.save(mom);
            }
        }
        log.info("Marked {} MOM actions as OVERDUE", overdue);
    }
}
