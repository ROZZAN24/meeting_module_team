package com.autonoma.erp.repository;

import com.autonoma.erp.model.InductionTrainingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InductionTrainingDetailRepository extends JpaRepository<InductionTrainingDetail, Long> {

    List<InductionTrainingDetail> findByAssignmentId(Long assignmentId);

    long countByAssignmentIdAndTrainerStatus(Long assignmentId, String trainerStatus);
}
