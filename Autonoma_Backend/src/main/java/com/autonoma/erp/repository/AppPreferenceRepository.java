package com.autonoma.erp.repository;

import com.autonoma.erp.model.AppPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppPreferenceRepository extends JpaRepository<AppPreference, Integer> {
    Optional<AppPreference> findByPrefName(String prefName);
}
