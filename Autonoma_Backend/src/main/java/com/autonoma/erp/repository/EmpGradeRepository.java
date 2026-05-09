package com.autonoma.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autonoma.erp.model.Gradedetails;

@Repository
public interface EmpGradeRepository extends JpaRepository<Gradedetails, Long> {

}
