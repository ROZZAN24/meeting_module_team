package com.autonoma.erp.repository;

import com.autonoma.erp.model.UserSessionActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionActivityRepository extends JpaRepository<UserSessionActivity, Long> {
    List<UserSessionActivity> findAllByUserIdOrderByEntryTimeDesc(String userId);
    
    Optional<UserSessionActivity> findTopByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(String userId);
}
