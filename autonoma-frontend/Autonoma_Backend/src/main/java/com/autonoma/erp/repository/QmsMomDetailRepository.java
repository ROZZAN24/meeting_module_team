package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsMomDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QmsMomDetailRepository extends JpaRepository<QmsMomDetail, Long> {
    @Query("SELECT d FROM QmsMomDetail d JOIN FETCH d.mom m LEFT JOIN FETCH m.schedule s LEFT JOIN FETCH d.assignedBy ab LEFT JOIN FETCH d.assignedTo at WHERE d.processType = 'ACTION'")
    List<QmsMomDetail> findAllActions();
}
