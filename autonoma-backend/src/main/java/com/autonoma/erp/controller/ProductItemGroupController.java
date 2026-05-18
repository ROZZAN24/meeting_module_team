package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductItemGroup;
import com.autonoma.erp.repository.ProductItemGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/master/npd/item-group")
@CrossOrigin(origins = "*")
@Tag(name = "NPD - Product Item Group Master", description = "Endpoints for managing NPD Product Item Groups")
public class ProductItemGroupController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductItemGroupController.class);

    @Autowired
    private ProductItemGroupRepository repository;

    @GetMapping
    @Operation(summary = "Get All Product Item Groups", description = "Fetches a complete list of product item groups")
    public List<ProductItemGroup> getAll() {
        log.info("Fetching all product item groups");
        return repository.findAll();
    }

    @PostMapping
    @Operation(summary = "Create Product Item Group", description = "Creates a new product item group")
    public ResponseEntity<?> create(@RequestBody ProductItemGroup itemGroup) {
        log.info("Creating product item group: {}", itemGroup);
        
        String name = itemGroup.getGroupName() != null ? itemGroup.getGroupName() : "";
        String sanitizedName = name.replaceAll("\\s+", " ").trim();
        
        if (sanitizedName.isEmpty()) {
            return ResponseEntity.badRequest().body("Group Name cannot be empty!");
        }

        if (repository.findByGroupName(sanitizedName).isPresent()) {
            return ResponseEntity.badRequest().body("Group Name already exists!");
        }

        itemGroup.setGroupName(sanitizedName);
        return ResponseEntity.ok(repository.save(itemGroup));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Product Item Group", description = "Updates an existing product item group")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProductItemGroup details) {
        log.info("Updating product item group ID {}: {}", id, details);

        String name = details.getGroupName() != null ? details.getGroupName() : "";
        String sanitizedName = name.replaceAll("\\s+", " ").trim();

        if (sanitizedName.isEmpty()) {
            return ResponseEntity.badRequest().body("Group Name cannot be empty!");
        }

        Optional<ProductItemGroup> existingByName = repository.findByGroupName(sanitizedName);
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Group Name already exists!");
        }

        return repository.findById(id)
                .map(itemGroup -> {
                    itemGroup.setGroupName(sanitizedName);
                    itemGroup.setDescription(details.getDescription());
                    itemGroup.setStatus(details.getStatus());
                    itemGroup.setUpdatedBy(details.getUpdatedBy());
                    return ResponseEntity.ok(repository.save(itemGroup));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Product Item Group", description = "Deletes a product item group by its ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting product item group ID: {}", id);
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
