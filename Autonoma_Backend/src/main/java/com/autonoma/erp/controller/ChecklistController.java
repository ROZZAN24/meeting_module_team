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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qms/checklist")
@Tag(name = "QMS - Master Checklist", description = "Endpoints for managing QMS Master Checklists, assignments, and verifications")
public class ChecklistController {

    @Autowired
    private ChecklistService checklistService;

    @GetMapping
    @Operation(summary = "Get Master Checklists", description = "Fetches a paginated list of Master Checklists with optional filters")
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
    @Operation(summary = "Create/Update Master Checklist", description = "Creates a new Master Checklist or updates an existing one")
    public ResponseEntity<MasterChecklist> createMasterChecklist(@RequestBody MasterChecklist checklist, @RequestParam(required = false) List<String> departments) {
        return ResponseEntity.ok(checklistService.saveMasterChecklist(checklist, departments));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Master Checklist", description = "Deletes a Master Checklist by ID")
    @CrossOrigin(origins = "*")
    public ResponseEntity<Void> deleteMasterChecklist(@PathVariable Long id) {
        System.out.println("Deleting checklist with ID: " + id);
        checklistService.deleteMasterChecklist(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/next-sequence")
    @Operation(summary = "Get Next Sequence Number", description = "Calculates the next available sequence number for a new checklist")
    public ResponseEntity<Map<String, Integer>> getNextSequence() {
        return ResponseEntity.ok(Map.of("nextSeqNo", checklistService.getNextSequenceNumber()));
    }

    @GetMapping("/assignments")
    @Operation(summary = "Get Checklist Assignments", description = "Fetches a paginated list of checklist assignments")
    public ResponseEntity<Page<ChecklistAssignment>> getAssignments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchBy,
            @RequestParam(required = false) String searchValue,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(checklistService.getAssignments(status, assignedTo, fromDate, toDate, category, searchBy, searchValue, pageable));
    }

    @PostMapping("/assign")
    @Operation(summary = "Assign Checklist to User", description = "Creates a new assignment for a specific checklist and user")
    public ResponseEntity<ChecklistAssignment> assignTask(@RequestBody Map<String, Object> payload) {
        Long checklistId = Long.valueOf(payload.get("checklistId").toString());
        String assignedTo = payload.get("assignedTo").toString();
        String assignedBy = payload.get("assignedBy").toString();
        return ResponseEntity.ok(checklistService.assignTask(checklistId, assignedTo, assignedBy));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Checklist Task", description = "Verifies a specific checklist assignment")
    public ResponseEntity<ChecklistVerification> verifyTask(@RequestBody Map<String, Object> payload) {
        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String verifiedBy = payload.get("verifiedBy").toString();
        String status = payload.get("status").toString();
        String remarks = payload.getOrDefault("remarks", "").toString();
        return ResponseEntity.ok(checklistService.verifyTask(assignmentId, verifiedBy, status, remarks));
    }

    @PostMapping("/verify-master")
    @Operation(summary = "Verify Master Checklist", description = "Approves or rejects a Master Checklist definition")
    public ResponseEntity<MasterChecklist> verifyMaster(@RequestBody Map<String, Object> payload) {
        Long checklistId = Long.valueOf(payload.get("checklistId").toString());
        String verifiedBy = payload.get("verifiedBy").toString();
        String status = payload.get("status").toString();
        String remarks = payload.getOrDefault("remarks", "").toString();
        return ResponseEntity.ok(checklistService.verifyMasterChecklist(checklistId, verifiedBy, status, remarks));
    }

    @GetMapping("/bootstrap")
    public ResponseEntity<String> bootstrap() {
        checklistService.seedStatuses();
        return ResponseEntity.ok("QMS Statuses seeded successfully");
    }
}
