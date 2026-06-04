package com.autonoma.erp.repository;

import com.autonoma.erp.model.InductionReassignmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InductionReassignmentLogRepository extends JpaRepository<InductionReassignmentLog, Long> {
    List<InductionReassignmentLog> findByTraineeEmpCode(String traineeEmpCode);
}
