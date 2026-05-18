package com.autonoma.erp.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autonoma.erp.model.admin.BosPage;

@Repository
public interface BosPageRepository extends JpaRepository<BosPage, Integer> {
}
