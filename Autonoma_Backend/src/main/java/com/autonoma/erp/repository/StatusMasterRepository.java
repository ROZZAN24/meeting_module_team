package com.autonoma.erp.repository;

import com.autonoma.erp.model.StatusMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StatusMasterRepository extends JpaRepository<StatusMaster, Long> {
    Optional<StatusMaster> findByName(String name);
}
