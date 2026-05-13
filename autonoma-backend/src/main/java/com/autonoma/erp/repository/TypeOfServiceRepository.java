package com.autonoma.erp.repository;

import com.autonoma.erp.model.TypeOfService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeOfServiceRepository extends JpaRepository<TypeOfService, Long> {
}
