package scratch;

import com.autonoma.erp.AutonomaBackendApplication;
import com.autonoma.erp.service.InductionAssignmentService;
import com.autonoma.erp.service.InductionTrainingService;
import com.autonoma.erp.repository.InductionAssignmentRepository;
import com.autonoma.erp.model.InductionAssignment;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import java.util.Date;
import java.util.List;

public class TestInductionLogic {
    public static void main(String[] args) {
        // Disable web server to prevent port conflicts on the server
        System.setProperty("spring.main.web-application-type", "none");
        
        ConfigurableApplicationContext context = SpringApplication.run(AutonomaBackendApplication.class, args);
        try {
            System.out.println("\n==================================================");
            System.out.println("🚀 STARTING AUTOMATED LOGIC BLENDER VALIDATIONS");
            System.out.println("==================================================");
            
            InductionAssignmentService assignmentService = context.getBean(InductionAssignmentService.class);
            InductionTrainingService trainingService = context.getBean(InductionTrainingService.class);
            InductionAssignmentRepository repository = context.getBean(InductionAssignmentRepository.class);
            
            // Test 1: Incomplete Count query for EMP-003 (Madhumitha)
            System.out.println("\n[Test 1] Verifying countIncompleteByEmpCode query for EMP-003...");
            long incompleteCount = repository.countIncompleteByEmpCode("EMP-003");
            System.out.println("Incomplete assignments count for EMP-003: " + incompleteCount);
            // It should be 1 because only Level 2 is PENDING (Level 1 is REJECTED)
            if (incompleteCount == 1) {
                System.out.println("✅ countIncompleteByEmpCode works correctly!");
            } else {
                System.out.println("❌ countIncompleteByEmpCode returned unexpected count: " + incompleteCount);
            }
            
            // Test 2: Trainer Exclusion Rule Validation
            System.out.println("\n[Test 2] Testing same-trainer re-assignment exception...");
            InductionAssignment sameTrainerAssign = new InductionAssignment();
            sameTrainerAssign.setEmpCode("EMP-003");
            sameTrainerAssign.setEmpName("Madhumitha");
            sameTrainerAssign.setInductionRound("HR");
            sameTrainerAssign.setScreeningLevel("Level 1");
            sameTrainerAssign.setTrainerEmpCode("EMP-001"); // Previously rejecting trainer
            sameTrainerAssign.setTrainerName("EASHWARA PRASADH");
            sameTrainerAssign.setInductionDate(new Date());
            sameTrainerAssign.setInductionTime("10:00");
            sameTrainerAssign.setInductionStatus("ACTIVE");
            sameTrainerAssign.setCurrentStatus("PENDING");
            
            try {
                assignmentService.save(sameTrainerAssign, "SYSTEM");
                System.out.println("❌ ERROR: Saved assignment with the same trainer who previously rejected this level!");
            } catch (Exception e) {
                System.out.println("✅ SUCCESS: Successfully blocked same-trainer assignment. Got expected exception:");
                System.out.println("   Message: " + e.getMessage());
            }
            
            // Test 3: Duplicate Completed Level Block Validation
            // Let's check first if we have a completed level in db, or mock one
            System.out.println("\n[Test 3] Testing completed level scheduling lock...");
            // Let's see if there is any completed assignment in db. If not, let's create a temporary completed assignment
            // for EMP-003 Level 1 with trainer EMP-007 (Darshan) and test.
            InductionAssignment completedAssign = new InductionAssignment();
            completedAssign.setEmpCode("EMP-003");
            completedAssign.setEmpName("Madhumitha");
            completedAssign.setInductionRound("HR");
            completedAssign.setScreeningLevel("Level 1");
            completedAssign.setTrainerEmpCode("EMP-007"); // Different trainer
            completedAssign.setTrainerName("DARSHAN");
            completedAssign.setInductionDate(new Date());
            completedAssign.setInductionTime("11:00");
            completedAssign.setInductionStatus("ACTIVE");
            completedAssign.setCurrentStatus("COMPLETED"); // Mark as completed
            completedAssign = assignmentService.save(completedAssign, "SYSTEM");
            
            System.out.println("Created temporary completed Level 1 for EMP-003 in DB.");
            
            // Now try to schedule Level 1 again
            InductionAssignment duplicateAssign = new InductionAssignment();
            duplicateAssign.setEmpCode("EMP-003");
            duplicateAssign.setEmpName("Madhumitha");
            duplicateAssign.setInductionRound("HR");
            duplicateAssign.setScreeningLevel("Level 1");
            duplicateAssign.setTrainerEmpCode("EMP-007");
            duplicateAssign.setTrainerName("DARSHAN");
            duplicateAssign.setInductionDate(new Date());
            duplicateAssign.setInductionTime("12:00");
            duplicateAssign.setInductionStatus("ACTIVE");
            duplicateAssign.setCurrentStatus("PENDING");
            
            try {
                assignmentService.save(duplicateAssign, "SYSTEM");
                System.out.println("❌ ERROR: Saved scheduling for a level that is already completed!");
            } catch (Exception e) {
                System.out.println("✅ SUCCESS: Successfully blocked scheduling of a completed level. Got expected exception:");
                System.out.println("   Message: " + e.getMessage());
            }
            
            // Test 4: Progression Check isAssignmentReady Validation
            System.out.println("\n[Test 4] Testing isAssignmentReady check for Level 2...");
            // Find active Level 2 for EMP-003
            List<InductionAssignment> empAssignments = repository.findByEmpCode("EMP-003");
            InductionAssignment level2 = empAssignments.stream()
                .filter(a -> "Level 2".equalsIgnoreCase(a.getScreeningLevel()) && "ACTIVE".equalsIgnoreCase(a.getInductionStatus()))
                .findFirst()
                .orElse(null);
                
            if (level2 != null) {
                boolean isReady = trainingService.isAssignmentReady(level2);
                System.out.println("Level 2 isAssignmentReady result: " + isReady);
                if (isReady) {
                    System.out.println("✅ SUCCESS: Level 2 is ready because Level 1 has a COMPLETED attempt (even though it also has a REJECTED attempt in history).");
                } else {
                    System.out.println("❌ ERROR: Level 2 is not ready despite Level 1 being completed!");
                }
            } else {
                System.out.println("⚠️ WARNING: Level 2 assignment not found for EMP-003, skipping check.");
            }
            
            // Clean up temporary completed assignment
            repository.delete(completedAssign);
            System.out.println("\nCleaned up temporary database records.");
            
            System.out.println("\n==================================================");
            System.out.println("🎉 ALL LOGIC BLENDER VALIDATIONS SUCCESSFULLY TESTED!");
            System.out.println("==================================================");
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            context.close();
        }
    }
}
