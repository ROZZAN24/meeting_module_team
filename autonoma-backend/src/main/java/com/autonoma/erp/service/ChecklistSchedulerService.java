package com.autonoma.erp.service;

import com.autonoma.erp.model.MasterChecklist;
import com.autonoma.erp.repository.MasterChecklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChecklistSchedulerService {

    private final MasterChecklistRepository masterRepo;
    private final ChecklistService checklistService;

    /**
     * Runs every day at 12:01 AM to generate recurring checklists
     * Cron: "0 1 0 * * *"
     */
    @Scheduled(cron = "0 1 0 * * *")
    @Transactional
    public void generateRecurringAssignments() {
        log.info("Starting recurring checklist assignment generation...");
        
        List<MasterChecklist> activeChecklists = masterRepo.findByStatusAndVerifyStatus("Active", "Verified");
        Date today = new Date();
        Calendar cal = Calendar.getInstance();
        cal.setTime(today);
        
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK); // 1 = Sunday, 2 = Monday...
        int dayOfMonth = cal.get(Calendar.DAY_OF_MONTH);
        
        for (MasterChecklist checklist : activeChecklists) {
            String frequency = checklist.getFrequency();
            if (frequency == null) continue;
            
            boolean shouldGenerate = false;
            
            switch (frequency.toUpperCase()) {
                case "DAILY":
                    shouldGenerate = true;
                    break;
                case "WEEKLY":
                    // Generate every Monday (assuming Monday is start of work week)
                    if (dayOfWeek == Calendar.MONDAY) {
                        shouldGenerate = true;
                    }
                    break;
                case "FORTNIGHTLY":
                    // Every 1st and 15th
                    if (dayOfMonth == 1 || dayOfMonth == 15) {
                        shouldGenerate = true;
                    }
                    break;
                case "MONTHLY":
                    // Every 1st of the month
                    if (dayOfMonth == 1) {
                        shouldGenerate = true;
                    }
                    break;
                case "QUARTERLY":
                    // 1st of Jan, Apr, Jul, Oct
                    if (dayOfMonth == 1 && (cal.get(Calendar.MONTH) % 3 == 0)) {
                        shouldGenerate = true;
                    }
                    break;
                case "HALF YEARLY":
                    // 1st of Jan, Jul
                    if (dayOfMonth == 1 && (cal.get(Calendar.MONTH) == Calendar.JANUARY || cal.get(Calendar.MONTH) == Calendar.JULY)) {
                        shouldGenerate = true;
                    }
                    break;
                case "YEARLY":
                    // 1st of Jan
                    if (dayOfMonth == 1 && cal.get(Calendar.MONTH) == Calendar.JANUARY) {
                        shouldGenerate = true;
                    }
                    break;
            }
            
            if (shouldGenerate && checklist.getAssignTo() != null && !checklist.getAssignTo().isEmpty()) {
                try {
                    log.info("Generating {} assignment for Checklist: {}", frequency, checklist.getSeqNo());
                    checklistService.assignTask(
                        null, 
                        checklist.getId(), 
                        checklist.getAssignTo(), 
                        "System Scheduler", 
                        "PRIMARY"
                    );
                } catch (Exception e) {
                    log.error("Failed to generate assignment for checklist {}: {}", checklist.getSeqNo(), e.getMessage());
                }
            }
        }
        
        log.info("Recurring checklist assignment generation completed.");
    }
}
