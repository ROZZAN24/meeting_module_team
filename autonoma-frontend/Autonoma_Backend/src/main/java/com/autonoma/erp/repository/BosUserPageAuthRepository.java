package com.autonoma.erp.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autonoma.erp.model.admin.BosUserPageAuth;

import java.util.List;

@Repository
public interface BosUserPageAuthRepository extends JpaRepository<BosUserPageAuth, Object> {
    List<BosUserPageAuth> findByUserId(String userId);
}
