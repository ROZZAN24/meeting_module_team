package com.autonoma.erp.repository;

import com.autonoma.erp.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentNo(Integer departmentNo);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.sequenceNo) FROM Department d")
    java.util.Optional<Integer> findMaxSequenceNo();

    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.departmentNo) FROM Department d")
    java.util.Optional<Integer> findMaxDepartmentNo();
}
