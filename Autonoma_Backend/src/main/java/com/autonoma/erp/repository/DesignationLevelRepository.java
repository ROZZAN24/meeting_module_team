package com.autonoma.erp.repository;

import com.autonoma.erp.model.DesignationLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

@Repository
public interface DesignationLevelRepository extends JpaRepository<DesignationLevel, Long> {
    @Query("SELECT MAX(d.screeningLevel) FROM DesignationLevel d")
    Optional<Integer> findMaxScreeningLevel();
}
