package com.autonoma.erp.controller;

import com.autonoma.erp.model.InductionRoundMaster;
import com.autonoma.erp.repository.InductionRoundMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/hr/induction-round")
@CrossOrigin(origins = "*")
public class InductionRoundMasterController {

    @Autowired
    private InductionRoundMasterRepository repository;

    /**
     * Get all rounds (ordered by displayOrder).
     */
    @GetMapping
    public ResponseEntity<List<InductionRoundMaster>> getAll() {
        return ResponseEntity.ok(repository.findAllOrdered());
    }

    /**
     * Get only ACTIVE rounds (used by dropdowns in Assignment & Criteria pages).
     */
    @GetMapping("/active")
    public ResponseEntity<List<InductionRoundMaster>> getActive() {
        return ResponseEntity.ok(repository.findAllActive());
    }

    /**
     * Create a new round.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody InductionRoundMaster entity, Principal principal) {
        try {
            // Duplicate check
            if (repository.findByRoundName(entity.getRoundName()).isPresent()) {
                return ResponseEntity.badRequest().body("Round '" + entity.getRoundName() + "' already exists.");
            }

            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            entity.setCreatedBy(currentUser);
            entity.setCreatedAt(new Date());
            if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
                entity.setStatus("ACTIVE");
            }
            return ResponseEntity.ok(repository.save(entity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update an existing round.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InductionRoundMaster entity, Principal principal) {
        try {
            InductionRoundMaster existing = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Round not found."));

            // Duplicate check (exclude self)
            repository.findByRoundName(entity.getRoundName()).ifPresent(found -> {
                if (!found.getId().equals(id)) {
                    throw new RuntimeException("Round '" + entity.getRoundName() + "' already exists.");
                }
            });

            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            existing.setRoundName(entity.getRoundName());
            existing.setDescription(entity.getDescription());
            existing.setStatus(entity.getStatus());
            existing.setDisplayOrder(entity.getDisplayOrder());
            existing.setUpdatedBy(currentUser);
            existing.setUpdatedAt(new Date());

            return ResponseEntity.ok(repository.save(existing));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Soft-delete (set status to IN ACTIVE).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivate(@PathVariable Long id, Principal principal) {
        try {
            InductionRoundMaster existing = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Round not found."));

            String currentUser = principal != null ? principal.getName() : "SYSTEM";
            existing.setStatus("IN ACTIVE");
            existing.setUpdatedBy(currentUser);
            existing.setUpdatedAt(new Date());
            repository.save(existing);

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
