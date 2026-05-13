package com.autonoma.erp.repository;

import com.autonoma.erp.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUserIdOrderByLoginTimeDesc(String userId);
    Optional<UserSession> findTopByUserIdAndStatusOrderByLoginTimeDesc(String userId, String status);
}
