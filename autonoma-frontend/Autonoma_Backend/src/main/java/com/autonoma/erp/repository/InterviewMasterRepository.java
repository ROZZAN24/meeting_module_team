package com.autonoma.erp.repository;

import com.autonoma.erp.model.InterviewMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewMasterRepository extends JpaRepository<InterviewMaster, Long> {
    @Query("SELECT MAX(i.id) FROM InterviewMaster i")
    Long findMaxId();
}
