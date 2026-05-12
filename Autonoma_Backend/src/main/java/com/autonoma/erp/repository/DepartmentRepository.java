package com.autonoma.erp.repository;

import com.autonoma.erp.model.DepartmentMaster;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentMaster, Long> {

    Optional<DepartmentMaster> findByDeptNo(Integer deptNo);

    boolean existsByDeptNo(Integer deptNo);

    @Query("SELECT MAX(d.deptNo) FROM DepartmentMaster d")
    Integer findMaxDeptNo();

    Page<DepartmentMaster> findByStatus(String status, Pageable pageable);

    @Query("SELECT d FROM DepartmentMaster d WHERE " +
           "LOWER(d.deptName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(d.deptNo AS string) LIKE CONCAT('%', :search, '%')")
    Page<DepartmentMaster> searchByKeyword(String search, Pageable pageable);

    @Query("SELECT d FROM DepartmentMaster d WHERE d.status = :status AND " +
           "(LOWER(d.deptName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "CAST(d.deptNo AS string) LIKE CONCAT('%', :search, '%'))")
    Page<DepartmentMaster> searchByKeywordAndStatus(String search, String status, Pageable pageable);
}
