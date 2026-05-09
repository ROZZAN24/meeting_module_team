package com.autonoma.erp.repository;

import com.autonoma.erp.model.CompanyCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyCredentialRepository extends JpaRepository<CompanyCredential, Integer> {
}
