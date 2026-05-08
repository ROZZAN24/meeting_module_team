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

    public Integer getNextSequenceNumber() {
        Integer maxSeq = masterRepo.findMaxSeqNo();
        return (maxSeq != null ? maxSeq : 0) + 1;
    }

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

            if (searchValue != null && !searchValue.isEmpty()) {
                String searchTerm = "%" + searchValue.toLowerCase() + "%";
                if (searchBy != null && !searchBy.isEmpty()) {
                    predicates.add(cb.like(cb.lower(root.get(searchBy)), searchTerm));
                } else {
                    List<Predicate> orPredicates = new ArrayList<>();
                    orPredicates.add(cb.like(cb.lower(root.get("seqNo")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("checkingPoint")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("category")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("frequency")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("status")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("createdBy")), searchTerm));
                    
                    Join<MasterChecklist, ChecklistDepartment> dJoin = root.join("departments", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(dJoin.get("departmentName")), searchTerm));
                    
                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
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
            existing.setVerifyStatus(checklist.getVerifyStatus());
            existing.setVerifiedBy(checklist.getVerifiedBy());
            existing.setVerifiedDate(checklist.getVerifiedDate());
            existing.setRejReason(checklist.getRejReason());
            existing.setAssignTo(checklist.getAssignTo());
            existing.setAssignDate(checklist.getAssignDate());
            existing.setItemCode(checklist.getItemCode());
            existing.setQty(checklist.getQty());
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
            if (checklist.getVerifyStatus() == null) checklist.setVerifyStatus("Pending for Verify");
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

    @Transactional
    public void deleteMasterChecklist(Long id) {
        MasterChecklist checklist = masterRepo.findById(id).orElseThrow();
        deptRepo.deleteByChecklist(checklist);
        masterRepo.delete(checklist);
    }

    // --- Assignments ---

    public Page<ChecklistAssignment> getAssignments(String status, String assignedTo, Date fromDate, Date toDate, String category, String searchBy, String searchValue, Pageable pageable) {
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

            if (searchValue != null && !searchValue.isEmpty()) {
                String searchTerm = "%" + searchValue.toLowerCase() + "%";
                if (searchBy != null && !searchBy.isEmpty()) {
                    predicates.add(cb.like(cb.lower(root.get(searchBy)), searchTerm));
                } else {
                    List<Predicate> orPredicates = new ArrayList<>();
                    orPredicates.add(cb.like(cb.lower(root.get("assignedTo")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(root.get("assignedBy")), searchTerm));
                    
                    Join<ChecklistAssignment, StatusMaster> sJoin = root.join("status", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(sJoin.get("name")), searchTerm));
                    
                    Join<ChecklistAssignment, MasterChecklist> cJoin = root.join("checklist", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(cJoin.get("seqNo")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("checkingPoint")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("category")), searchTerm));
                    orPredicates.add(cb.like(cb.lower(cJoin.get("frequency")), searchTerm));
                    
                    Join<MasterChecklist, ChecklistDepartment> dJoin = cJoin.join("departments", JoinType.LEFT);
                    orPredicates.add(cb.like(cb.lower(dJoin.get("departmentName")), searchTerm));

                    predicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
                }
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

    @Transactional
    public MasterChecklist verifyMasterChecklist(Long checklistId, String verifiedBy, String status, String remarks) {
        MasterChecklist checklist = masterRepo.findById(checklistId).orElseThrow();
        checklist.setVerifyStatus(status);
        checklist.setVerifiedBy(verifiedBy);
        checklist.setVerifiedDate(new Date());
        if ("Rejected".equals(status)) {
            checklist.setRejReason(remarks);
        }
        return masterRepo.save(checklist);
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
