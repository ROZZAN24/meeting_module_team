package com.autonoma.erp.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autonoma.erp.model.admin.UserCredential;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserCredential, String> {
    Optional<UserCredential> findByUserId(String userId);
    boolean existsByEmpId(Long empId);
    void deleteByEmpId(Long empId);
}
