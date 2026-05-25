package com.autonoma.erp.service;

import com.autonoma.erp.model.MasterChecklist;
import com.autonoma.erp.model.ChecklistAssignment;
import com.autonoma.erp.model.StatusMaster;
import com.autonoma.erp.repository.MasterChecklistRepository;
import com.autonoma.erp.repository.ChecklistAssignmentRepository;
import com.autonoma.erp.repository.StatusMasterRepository;
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
    private final ChecklistAssignmentRepository assignRepo;
    private final StatusMasterRepository statusRepo;

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

    /**
     * Runs every day at 11:59 PM IST to process uncompleted checklists
     * Cron: "0 59 23 * * *" in Asia/Kolkata
     */
    @Scheduled(cron = "0 59 23 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void processUncompletedChecklists() {
        log.info("Starting processing of uncompleted checklists at the end of the day...");
        
        Date today = new Date();
        List<ChecklistAssignment> uncompleted = assignRepo.findUncompletedAssignments(today);
        log.info("Found {} uncompleted checklist assignments to process.", uncompleted.size());

        StatusMaster unresolvedStatus = statusRepo.findByName("Unresolved").orElse(null);
        StatusMaster pendingStatus = statusRepo.findByName("Pending").orElse(null);

        if (unresolvedStatus == null || pendingStatus == null) {
            log.error("Required StatusMaster records ('Unresolved' or 'Pending') are missing from database.");
            return;
        }

        for (ChecklistAssignment assignment : uncompleted) {
            MasterChecklist master = assignment.getChecklist();
            String carryForwardConfig = master != null ? master.getCarryForward() : assignment.getCarryForward();
            
            if ("YES".equalsIgnoreCase(carryForwardConfig)) {
                // If carry forward was yes: the status will be in pending and carry forward count should be increased by one
                assignment.setStatus(pendingStatus);
                int currentCount = assignment.getCarryForwardCount() != null ? assignment.getCarryForwardCount() : 0;
                assignment.setCarryForwardCount(currentCount + 1);
                assignment.setCarryForwardStatus("YES");
                
                // Carry forward the date to tomorrow (next day) so it shows up in tomorrow's active workload
                Calendar tomorrow = Calendar.getInstance();
                tomorrow.setTime(assignment.getChecklistDate() != null ? assignment.getChecklistDate() : today);
                tomorrow.add(Calendar.DAY_OF_YEAR, 1);
                assignment.setChecklistDate(tomorrow.getTime());

                assignment.setRemarks((assignment.getRemarks() == null ? "" : assignment.getRemarks() + "\n") 
                        + "Automatically carried forward at end of day. Count: " + (currentCount + 1));
                
                log.info("Checklist assignment {} carried forward to tomorrow. Count: {}", assignment.getId(), currentCount + 1);
            } else {
                // If Carry Forward was no: end of the day the particular check list will be unresolved
                assignment.setStatus(unresolvedStatus);
                assignment.setCarryForwardStatus("NO");
                
                assignment.setRemarks((assignment.getRemarks() == null ? "" : assignment.getRemarks() + "\n") 
                        + "Automatically marked Unresolved at end of day.");
                
                log.info("Checklist assignment {} marked Unresolved at end of day.", assignment.getId());
            }
            
            assignment.setUpdatedAt(new Date());
            assignment.setUpdatedBy("System Scheduler");
            assignRepo.save(assignment);
        }
        
        log.info("Completed processing of uncompleted checklists.");
    }
}
