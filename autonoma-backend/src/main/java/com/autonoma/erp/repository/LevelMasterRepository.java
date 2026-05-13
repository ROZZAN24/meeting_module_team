package com.autonoma.erp.repository;

import com.autonoma.erp.model.LevelMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelMasterRepository extends JpaRepository<LevelMaster, Long> {
}
