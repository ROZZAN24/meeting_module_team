package com.autonoma.erp.repository;

import com.autonoma.erp.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentNo(Integer departmentNo);
    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE LOWER(LTRIM(RTRIM(dept_name))) = LOWER(LTRIM(RTRIM(:name)))", nativeQuery = true)
    int existsByNameNative(@org.springframework.data.repository.query.Param("name") String name);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE LOWER(LTRIM(RTRIM(dept_name))) = LOWER(LTRIM(RTRIM(:name))) AND id != :id", nativeQuery = true)
    int existsByNameNativeWithId(@org.springframework.data.repository.query.Param("name") String name, @org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.sequenceNo) FROM Department d")
    java.util.Optional<Integer> findMaxSequenceNo();

    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.departmentNo) FROM Department d")
    java.util.Optional<Integer> findMaxDepartmentNo();
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM hrm_department_master WHERE status = :status", nativeQuery = true)
    java.util.List<Department> findByStatus(@org.springframework.data.repository.query.Param("status") String status);
}
