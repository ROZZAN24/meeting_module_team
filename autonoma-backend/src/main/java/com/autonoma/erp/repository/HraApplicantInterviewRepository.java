package com.autonoma.erp.repository;

import com.autonoma.erp.model.HraApplicantInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HraApplicantInterviewRepository extends JpaRepository<HraApplicantInterview, Long> {
    List<HraApplicantInterview> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
