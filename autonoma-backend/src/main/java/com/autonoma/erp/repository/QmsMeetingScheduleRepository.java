package com.autonoma.erp.repository;

import com.autonoma.erp.model.QmsMeetingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QmsMeetingScheduleRepository extends JpaRepository<QmsMeetingSchedule, Long> {
    @Query("SELECT MAX(s.id) FROM QmsMeetingSchedule s")
    Optional<Long> findMaxId();
    
    Optional<QmsMeetingSchedule> findByScheduleNo(String scheduleNo);
    
    java.util.List<QmsMeetingSchedule> findByScheduleNoStartingWith(String prefix);
}
