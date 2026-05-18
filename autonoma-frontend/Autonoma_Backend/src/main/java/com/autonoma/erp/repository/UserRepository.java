package com.autonoma.erp.repository;

import com.autonoma.erp.model.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserCredential, String> {
    Optional<UserCredential> findByUserId(String userId);
}
