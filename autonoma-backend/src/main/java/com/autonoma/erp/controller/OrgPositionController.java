package com.autonoma.erp.controller;

import com.autonoma.erp.dto.OrgPositionDTO;
import com.autonoma.erp.model.OrgPosition;
import com.autonoma.erp.service.OrgPositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.model.EmployeeManagerMapping;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import com.autonoma.erp.repository.EmployeeManagerMappingRepository;

@RestController
@RequestMapping("/api/master/hr/positions")
public class OrgPositionController {

    @Autowired
    private OrgPositionService positionService;

    @Autowired
    private EmployeeMasterRepository employeeRepo;

    @Autowired
    private EmployeeManagerMappingRepository mappingRepo;

    @Autowired
    private com.autonoma.erp.repository.OrgPositionRepository positionRepo;

    @PostMapping("/migrate")
    public ResponseEntity<String> migrateFromMappings() {
        if (positionRepo.count() > 0) {
            return ResponseEntity.badRequest().body("Positions table is not empty. Migration aborted.");
        }

        List<EmployeeMaster> employees = employeeRepo.findByStatus("Active");
        List<EmployeeManagerMapping> mappings = mappingRepo.findAll();

        Map<Long, Long> empToManagerMap = new java.util.HashMap<>();
        for (EmployeeManagerMapping m : mappings) {
            empToManagerMap.put(m.getEmpId(), m.getHomeManagerId());
        }

        Map<Long, OrgPosition> empToPosMap = new java.util.HashMap<>();
        
        // Phase 1: Create a position for each active employee
        for (EmployeeMaster emp : employees) {
            OrgPosition pos = new OrgPosition();
            pos.setPositionTitle(emp.getDesignationId() != null ? String.valueOf(emp.getDesignationId()) : "Employee");
            pos.setDepartmentId(emp.getDepartmentId());
            pos.setAssignedEmployeeId(emp.getId());
            pos.setStatus("Active");
            pos = positionRepo.save(pos);
            empToPosMap.put(emp.getId(), pos);
        }

        // Phase 2: Link parent positions based on manager mapping
        for (EmployeeMaster emp : employees) {
            Long managerId = empToManagerMap.get(emp.getId());
            if (managerId != null) {
                OrgPosition childPos = empToPosMap.get(emp.getId());
                OrgPosition parentPos = empToPosMap.get(managerId);
                if (childPos != null && parentPos != null) {
                    childPos.setParentPositionId(parentPos.getId());
                    positionRepo.save(childPos);
                }
            }
        }

        return ResponseEntity.ok("Migration successful! Created " + empToPosMap.size() + " positions.");
    }

    @GetMapping("/tree")
    public ResponseEntity<List<OrgPositionDTO>> getPositionTree() {
        return ResponseEntity.ok(positionService.getPositionTree());
    }

    @PostMapping
    public ResponseEntity<OrgPosition> createPosition(@RequestBody OrgPosition position) {
        return ResponseEntity.ok(positionService.createPosition(position));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrgPosition> updatePosition(@PathVariable Long id, @RequestBody OrgPosition position) {
        return ResponseEntity.ok(positionService.updatePosition(id, position));
    }

    @PostMapping("/assign")
    public ResponseEntity<OrgPosition> assignEmployee(@RequestBody Map<String, Long> payload) {
        Long positionId = payload.get("positionId");
        Long employeeId = payload.get("employeeId");
        return ResponseEntity.ok(positionService.assignEmployee(positionId, employeeId));
    }

    @PostMapping("/unassign")
    public ResponseEntity<OrgPosition> unassignEmployee(@RequestBody Map<String, Long> payload) {
        Long positionId = payload.get("positionId");
        return ResponseEntity.ok(positionService.unassignEmployee(positionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePosition(@PathVariable Long id) {
        try {
            positionService.deletePosition(id);
            return ResponseEntity.ok("Deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
