package com.autonoma.erp.repository;

import com.autonoma.erp.model.InductionAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InductionAssignmentRepository extends JpaRepository<InductionAssignment, Long> {
    
    List<InductionAssignment> findByEmpCode(String empCode);
    
    @Query("SELECT a FROM InductionAssignment a WHERE a.empCode = :empCode AND a.inductionRound = :round AND a.inductionStatus = 'ACTIVE'")
    List<InductionAssignment> findActiveAssignmentsByEmpAndRound(@org.springframework.data.repository.query.Param("empCode") String empCode, @org.springframework.data.repository.query.Param("round") String round);

    @Query("SELECT a FROM InductionAssignment a WHERE a.inductionStatus = 'ACTIVE'")
    List<InductionAssignment> findAllActive();

    // === Trainer page: only assignments where current user is the trainer ===
    @Query("SELECT a FROM InductionAssignment a WHERE a.trainerEmpCode = :trainerEmpCode AND a.inductionStatus = 'ACTIVE'")
    List<InductionAssignment> findByTrainerEmpCode(@org.springframework.data.repository.query.Param("trainerEmpCode") String trainerEmpCode);

    // === Trainee page: only assignments for the current employee with TRAINING GIVEN status ===
    @Query("SELECT a FROM InductionAssignment a WHERE a.empCode = :empCode AND a.currentStatus = 'TRAINING GIVEN' AND a.inductionStatus = 'ACTIVE'")
    List<InductionAssignment> findTraineeRecords(@org.springframework.data.repository.query.Param("empCode") String empCode);

    // === Check if all rounds are completed for an employee ===
    @Query("SELECT COUNT(a) FROM InductionAssignment a WHERE a.empCode = :empCode AND a.inductionStatus = 'ACTIVE' AND a.currentStatus != 'COMPLETED'")
    long countIncompleteByEmpCode(@org.springframework.data.repository.query.Param("empCode") String empCode);
}

