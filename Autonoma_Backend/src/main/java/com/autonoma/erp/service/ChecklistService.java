package com.autonoma.erp.service;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ChecklistService {

    @Autowired
    private MasterChecklistRepository masterRepo;

    @Autowired
    private ChecklistAssignmentRepository assignRepo;

    @Autowired
    private ChecklistVerificationRepository verifyRepo;

    @Autowired
    private StatusMasterRepository statusRepo;

    @Autowired
    private ChecklistDepartmentRepository deptRepo;

    // --- Master Checklist ---

    public Page<MasterChecklist> getAllChecklists(String status, String category, String department, String searchBy, String searchValue, Pageable pageable) {
        return masterRepo.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null && !status.equals("All")) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (category != null && !category.equals("All")) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (department != null && !department.isEmpty()) {
                Join<MasterChecklist, ChecklistDepartment> deptJoin = root.join("departments");
                predicates.add(cb.equal(deptJoin.get("departmentName"), department));
            }

            if (searchBy != null && searchValue != null && !searchValue.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get(searchBy)), "%" + searchValue.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public MasterChecklist saveMasterChecklist(MasterChecklist checklist, List<String> departments) {
        if (checklist.getId() != null) {
            MasterChecklist existing = masterRepo.findById(checklist.getId()).orElseThrow();
            // Update fields
            existing.setSeqNo(checklist.getSeqNo());
            existing.setCheckingPoint(checklist.getCheckingPoint());
            existing.setDescription(checklist.getDescription());
            existing.setCategory(checklist.getCategory());
            existing.setFrequency(checklist.getFrequency());
            existing.setExpiryDate(checklist.getExpiryDate());
            existing.setReminderDays(checklist.getReminderDays());
            existing.setReminderDate(checklist.getReminderDate());
            existing.setStockLink(checklist.getStockLink());
            existing.setPhotoRequired(checklist.getPhotoRequired());
            existing.setVerificationRequired(checklist.getVerificationRequired());
            existing.setStatus(checklist.getStatus());
            existing.setUpdatedDate(new Date());
            
            // Re-sync departments
            deptRepo.deleteByChecklist(existing);
            if (departments != null) {
                for (String deptName : departments) {
                    ChecklistDepartment dept = new ChecklistDepartment();
                    dept.setChecklist(existing);
                    dept.setDepartmentName(deptName);
                    deptRepo.save(dept);
                }
            }
            return masterRepo.save(existing);
        } else {
            checklist.setCreatedDate(new Date());
            if (checklist.getStatus() == null) checklist.setStatus("Pending for Verify");
            MasterChecklist saved = masterRepo.save(checklist);
            if (departments != null) {
                for (String deptName : departments) {
                    ChecklistDepartment dept = new ChecklistDepartment();
                    dept.setChecklist(saved);
                    dept.setDepartmentName(deptName);
                    deptRepo.save(dept);
                }
            }
            return saved;
        }
    }

    // --- Assignments ---

    public Page<ChecklistAssignment> getAssignments(String status, String assignedTo, Date fromDate, Date toDate, String category, Pageable pageable) {
        return assignRepo.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.equals("All")) {
                Join<ChecklistAssignment, StatusMaster> statusJoin = root.join("status");
                predicates.add(cb.equal(statusJoin.get("name"), status));
            }

            if (assignedTo != null && !assignedTo.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("assignedTo")), "%" + assignedTo.toLowerCase() + "%"));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("checklistDate"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("checklistDate"), toDate));
            }

            if (category != null && !category.equals("All")) {
                Join<ChecklistAssignment, MasterChecklist> masterJoin = root.join("checklist");
                predicates.add(cb.equal(masterJoin.get("category"), category));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public ChecklistAssignment assignTask(Long checklistId, String assignedTo, String assignedBy) {
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();
        
        ChecklistAssignment assignment = new ChecklistAssignment();
        assignment.setChecklist(checklist);
        assignment.setAssignedTo(assignedTo);
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignedDate(new Date());
        
        // Default status: Pending
        statusRepo.findByName("Pending").ifPresent(assignment::setStatus);
        
        return assignRepo.save(assignment);
    }

    // --- Verification ---

    @Transactional
    public ChecklistVerification verifyTask(Long assignmentId, String verifiedBy, String statusName, String remarks) {
        ChecklistAssignment assignment = assignRepo.findById(assignmentId).orElseThrow();
        StatusMaster status = statusRepo.findByName(statusName).orElseThrow();
        
        // Create verification record
        ChecklistVerification verification = new ChecklistVerification();
        verification.setAssignment(assignment);
        verification.setVerifiedBy(verifiedBy);
        verification.setStatus(status);
        verification.setRemarks(remarks);
        verification.setVerifiedDate(new Date());
        
        // Update assignment status
        assignment.setStatus(status);
        assignRepo.save(assignment);
        
        return verifyRepo.save(verification);
    }

    // --- Status Master Helpers ---

    @Transactional
    public void seedStatuses() {
        String[] statuses = {
            "Pending", "Started", "Unresolved", "Missed", "Completed", 
            "Not Completed", "25%", "50%", "75%", "Pending for Verified", 
            "Verified", "Pending for Accepted", "Accepted", "Attended", "Rejected", "Open"
        };
        for (String s : statuses) {
            if (statusRepo.findByName(s).isEmpty()) {
                StatusMaster sm = new StatusMaster();
                sm.setName(s);
                statusRepo.save(sm);
            }
        }
    }
}
