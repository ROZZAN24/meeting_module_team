package com.autonoma.erp.controller;

import com.autonoma.erp.model.*;
import com.autonoma.erp.service.ChecklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qms/checklist")
public class ChecklistController {

    @Autowired
    private ChecklistService checklistService;

    @GetMapping
    public ResponseEntity<Page<MasterChecklist>> getMasterChecklist(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String searchBy,
            @RequestParam(required = false) String searchValue,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(checklistService.getAllChecklists(status, category, department, searchBy, searchValue, pageable));
    }

    @PostMapping
    public ResponseEntity<MasterChecklist> createMasterChecklist(@RequestBody MasterChecklist checklist, @RequestParam(required = false) List<String> departments) {
        return ResponseEntity.ok(checklistService.saveMasterChecklist(checklist, departments));
    }

    @GetMapping("/assignments")
    public ResponseEntity<Page<ChecklistAssignment>> getAssignments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(checklistService.getAssignments(status, assignedTo, fromDate, toDate, category, pageable));
    }

    @PostMapping("/assign")
    public ResponseEntity<ChecklistAssignment> assignTask(@RequestBody Map<String, Object> payload) {
        Long checklistId = Long.valueOf(payload.get("checklistId").toString());
        String assignedTo = payload.get("assignedTo").toString();
        String assignedBy = payload.get("assignedBy").toString();
        return ResponseEntity.ok(checklistService.assignTask(checklistId, assignedTo, assignedBy));
    }

    @PostMapping("/verify")
    public ResponseEntity<ChecklistVerification> verifyTask(@RequestBody Map<String, Object> payload) {
        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String verifiedBy = payload.get("verifiedBy").toString();
        String status = payload.get("status").toString();
        String remarks = payload.getOrDefault("remarks", "").toString();
        return ResponseEntity.ok(checklistService.verifyTask(assignmentId, verifiedBy, status, remarks));
    }

    @GetMapping("/bootstrap")
    public ResponseEntity<String> bootstrap() {
        checklistService.seedStatuses();
        return ResponseEntity.ok("QMS Statuses seeded successfully");
    }
}
