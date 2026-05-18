package com.autonoma.erp.repository;

import com.autonoma.erp.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
<<<<<<< HEAD
    Optional<Department> findByDepartmentNo(String departmentNo);
    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE LOWER(LTRIM(RTRIM(dept_name))) = LOWER(LTRIM(RTRIM(:name)))", nativeQuery = true)
    int existsByNameNative(@org.springframework.data.repository.query.Param("name") String name);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE LOWER(LTRIM(RTRIM(dept_name))) = LOWER(LTRIM(RTRIM(:name))) AND id != :id", nativeQuery = true)
    int existsByNameNativeWithId(@org.springframework.data.repository.query.Param("name") String name, @org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE dept_no = :deptNo", nativeQuery = true)
    int existsByDeptNoNative(@org.springframework.data.repository.query.Param("deptNo") String deptNo);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE dept_no = :deptNo AND id != :id", nativeQuery = true)
    int existsByDeptNoNativeWithId(@org.springframework.data.repository.query.Param("deptNo") String deptNo, @org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE seq_no = :seqNo", nativeQuery = true)
    int existsBySeqNoNative(@org.springframework.data.repository.query.Param("seqNo") Integer seqNo);

    @org.springframework.data.jpa.repository.Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM hrm_department_master WHERE seq_no = :seqNo AND id != :id", nativeQuery = true)
    int existsBySeqNoNativeWithId(@org.springframework.data.repository.query.Param("seqNo") Integer seqNo, @org.springframework.data.repository.query.Param("id") Long id);
=======
    Optional<Department> findByDepartmentNo(Integer departmentNo);
>>>>>>> origin/chore/repo-cleanup

    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.sequenceNo) FROM Department d")
    java.util.Optional<Integer> findMaxSequenceNo();

<<<<<<< HEAD
    @org.springframework.data.jpa.repository.Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(dept_no, 6, LEN(dept_no)) AS INT)), 0) FROM hrm_department_master WHERE dept_no LIKE 'DEPT-%'", nativeQuery = true)
    Long findMaxDeptNumeric();
=======
    @org.springframework.data.jpa.repository.Query("SELECT MAX(d.departmentNo) FROM Department d")
    java.util.Optional<Integer> findMaxDepartmentNo();
>>>>>>> origin/chore/repo-cleanup
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM hrm_department_master WHERE status = :status", nativeQuery = true)
    java.util.List<Department> findByStatus(@org.springframework.data.repository.query.Param("status") String status);
}
