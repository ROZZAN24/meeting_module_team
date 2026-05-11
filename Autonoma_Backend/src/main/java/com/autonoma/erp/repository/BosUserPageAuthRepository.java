package com.autonoma.erp.repository;

import com.autonoma.erp.model.BosUserPageAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BosUserPageAuthRepository extends JpaRepository<BosUserPageAuth, Object> {
    List<BosUserPageAuth> findByUserId(String userId);
}
