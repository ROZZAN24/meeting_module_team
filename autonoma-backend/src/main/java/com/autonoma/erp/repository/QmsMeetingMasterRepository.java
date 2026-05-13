package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsMeetingMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QmsMeetingMasterRepository extends JpaRepository<QmsMeetingMaster, Integer> {
    List<QmsMeetingMaster> findByStatus(String status);
}
