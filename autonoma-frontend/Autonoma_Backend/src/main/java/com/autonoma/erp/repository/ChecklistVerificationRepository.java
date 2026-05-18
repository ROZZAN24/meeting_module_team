package com.autonoma.erp.repository;

import com.autonoma.erp.model.ChecklistVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistVerificationRepository extends JpaRepository<ChecklistVerification, Long> {
    void deleteByAssignment(com.autonoma.erp.model.ChecklistAssignment assignment);
}
