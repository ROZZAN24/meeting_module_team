package com.autonoma.erp.repository;

import com.autonoma.erp.model.EmployeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeMasterRepository extends JpaRepository<EmployeeMaster, Long> {
    boolean existsByEmpCode(String empCode);
    boolean existsByEmpCodeAndIdNot(String empCode, Long id);
    java.util.Optional<EmployeeMaster> findFirstByOrderByEmpCodeDesc();
    java.util.List<EmployeeMaster> findByStatus(String status);
    java.util.Optional<EmployeeMaster> findByEmpCode(String empCode);
    java.util.List<EmployeeMaster> findByIsInductionEligibleAndStatus(String isInductionEligible, String status);
    java.util.List<EmployeeMaster> findByEmpCodeStartingWith(String prefix);
    boolean existsByVerticalHeadIgnoreCase(String verticalHead);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EmployeeMaster e WHERE (e.isActive = true OR LOWER(e.status) = 'active') AND " +
           "(LOWER(e.verticalHead) = LOWER(:name) OR LOWER(e.verticalHead) = LOWER(:code) OR LOWER(e.verticalHead) = LOWER(:username))")
    java.util.List<EmployeeMaster> findActiveReportsByVerticalHead(
        @org.springframework.data.repository.query.Param("name") String name,
        @org.springframework.data.repository.query.Param("code") String code,
        @org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EmployeeMaster e WHERE LOWER(e.empCode) = LOWER(:assignedTo) OR LOWER(e.employeeName) = LOWER(:assignedTo) OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) = LOWER(:assignedTo)")
    java.util.Optional<EmployeeMaster> findByEmpCodeOrName(@org.springframework.data.repository.query.Param("assignedTo") String assignedTo);
}

