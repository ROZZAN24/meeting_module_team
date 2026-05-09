package com.autonoma.erp.repository;

import com.autonoma.erp.model.AppPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppPreferenceRepository extends JpaRepository<AppPreference, Integer> {
}
