package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeKycDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeKycDocumentRepository extends JpaRepository<EmployeeKycDocument, Long> {
    List<EmployeeKycDocument> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
