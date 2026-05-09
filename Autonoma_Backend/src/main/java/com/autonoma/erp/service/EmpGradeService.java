package com.autonoma.erp.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autonoma.erp.model.Gradedetails;
import com.autonoma.erp.repository.EmpGradeRepository;

@Service
public class EmpGradeService {

    @Autowired
    private EmpGradeRepository repository;

    public List<Gradedetails> getAllGradeDetails() {
        return repository.findAll();
    }

    public Gradedetails getGradeDetailById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Gradedetails createGradeDetail(Gradedetails gradeDetail) {
        if (gradeDetail.getCreatedDate() == null) {
            gradeDetail.setCreatedDate(new Date());
        }
        if (gradeDetail.getCreatedBy() == null) {
            gradeDetail.setCreatedBy("Admin");
        }
        if (gradeDetail.getStatus() == null) {
            gradeDetail.setStatus("Active");
        }
        return repository.save(gradeDetail);
    }

    public Gradedetails updateGradeDetail(Long id, Gradedetails gradeDetailDetails) {
        Gradedetails gradeDetail = repository.findById(id).orElse(null);
        if (gradeDetail != null) {
            gradeDetail.setGradeCode(gradeDetailDetails.getGradeCode());
            gradeDetail.setSequenceNo(gradeDetailDetails.getSequenceNo());
            gradeDetail.setGradeName(gradeDetailDetails.getGradeName());
            gradeDetail.setStatus(gradeDetailDetails.getStatus());
            gradeDetail.setUpdatedBy(gradeDetailDetails.getUpdatedBy() != null ? gradeDetailDetails.getUpdatedBy() : "Admin");
            return repository.save(gradeDetail);
        }
        return null;
    }

    public void deleteGradeDetail(Long id) {
        repository.deleteById(id);
    }
}
