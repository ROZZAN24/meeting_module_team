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
     * Runs every day at 4:00 AM IST to generate recurring checklists
     * Cron: "0 0 4 * * *" in Asia/Kolkata
     */
    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Kolkata")
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
            
            // Anchoring logic: Recurrence is based on the components of the 'Effective From' date
            Calendar effectiveCal = Calendar.getInstance();
            if (checklist.getEffectiveFrom() != null) {
                effectiveCal.setTime(checklist.getEffectiveFrom());
            } else {
                effectiveCal.setTime(checklist.getCreatedDate() != null ? checklist.getCreatedDate() : today);
            }

            int effectiveDayOfWeek = effectiveCal.get(Calendar.DAY_OF_WEEK);
            int effectiveDayOfMonth = effectiveCal.get(Calendar.DAY_OF_MONTH);
            int effectiveMonth = effectiveCal.get(Calendar.MONTH);

            switch (frequency.toUpperCase()) {
                case "DAILY":
                    shouldGenerate = true;
                    break;
                case "WEEKLY":
                    // Generate on the same weekday as the Effective From date
                    if (dayOfWeek == effectiveDayOfWeek) {
                        shouldGenerate = true;
                    }
                    break;
                case "FORTNIGHTLY":
                    // Every 14 days from effective date OR on effective day and effective day + 14? 
                    // Usually FORTNIGHTLY in this context means "bi-monthly" like 1st and 15th or based on start.
                    // For simplicity and matching user intent: 
                    // Repeat on effectiveDayOfMonth and (effectiveDayOfMonth + 14) % 30 (approx)
                    if (dayOfMonth == effectiveDayOfMonth || dayOfMonth == (effectiveDayOfMonth + 14) % 28 + 1) {
                        shouldGenerate = true;
                    }
                    break;
                case "MONTHLY":
                    // Every month on the same date as Effective From
                    if (dayOfMonth == effectiveDayOfMonth) {
                        shouldGenerate = true;
                    }
                    break;
                case "QUARTERLY":
                    // Every 3 months on the same date
                    if (dayOfMonth == effectiveDayOfMonth && (cal.get(Calendar.MONTH) - effectiveMonth) % 3 == 0) {
                        shouldGenerate = true;
                    }
                    break;
                case "HALF YEARLY":
                    // Every 6 months on the same date
                    if (dayOfMonth == effectiveDayOfMonth && (cal.get(Calendar.MONTH) - effectiveMonth) % 6 == 0) {
                        shouldGenerate = true;
                    }
                    break;
                case "YEARLY":
                    // Once per year on the same date
                    if (dayOfMonth == effectiveDayOfMonth && cal.get(Calendar.MONTH) == effectiveMonth) {
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
                        "PRIMARY",
                        today
                    );
                } catch (Exception e) {
                    log.error("Failed to generate assignment for checklist {}: {}", checklist.getSeqNo(), e.getMessage());
                }
            }
        }
        
        log.info("Recurring checklist assignment generation completed.");
    }
}
