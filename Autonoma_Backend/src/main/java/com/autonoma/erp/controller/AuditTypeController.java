package com.autonoma.erp.controller;

import com.autonoma.erp.model.AuditType;
import com.autonoma.erp.repository.AuditTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/qms/audit-type")
@CrossOrigin(origins = "*")
public class AuditTypeController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuditTypeController.class);

    @Autowired
    private com.autonoma.erp.service.AuditTypeService auditTypeService;

    @GetMapping
    public ResponseEntity<java.util.Map<String, Object>> getAllAuditTypes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String auditArea,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Fetching audit types with search: {}, status: {}, area: {}, page: {}, size: {}", search, status, auditArea, page, size);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<AuditType> auditTypePage = auditTypeService.getAllPaginated(search, status, auditArea, pageable);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", auditTypePage.getContent());
        response.put("totalElements", auditTypePage.getTotalElements());
        response.put("totalPages", auditTypePage.getTotalPages());
        response.put("currentPage", auditTypePage.getNumber());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public List<AuditType> getActiveAuditTypes() {
        return auditTypeService.getActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditType> getAuditTypeById(@PathVariable Long id) {
        return auditTypeService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AuditType createAuditType(@RequestBody AuditType auditType) {
        log.info("Saving audit type: {}", auditType);
        return auditTypeService.save(auditType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditType> updateAuditType(@PathVariable Long id, @RequestBody AuditType auditType) {
        auditType.setId(id);
        return ResponseEntity.ok(auditTypeService.save(auditType));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditType(@PathVariable Long id) {
        auditTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
