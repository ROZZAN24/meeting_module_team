package com.autonoma.erp.controller;

import com.autonoma.erp.model.ProductItemType;
import com.autonoma.erp.repository.ProductItemTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/master/npd/item-type")
@CrossOrigin(origins = "*")
@Tag(name = "NPD - Product Item Type Master", description = "Endpoints for managing NPD Product Item Types")
public class ProductItemTypeController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductItemTypeController.class);

    @Autowired
    private ProductItemTypeRepository repository;

    @GetMapping
    @Operation(summary = "Get All Product Item Types", description = "Fetches a complete list of product item types")
    public List<ProductItemType> getAll() {
        log.info("Fetching all product item types");
        return repository.findAll();
    }

    @PostMapping
    @Operation(summary = "Create Product Item Type", description = "Creates a new product item type")
    public ResponseEntity<?> create(@RequestBody ProductItemType itemType) {
        log.info("Creating product item type: {}", itemType);

        if (itemType.getGroup() == null || itemType.getGroup().getId() == null) {
            return ResponseEntity.badRequest().body("Item Group must be selected!");
        }

        String typeName = itemType.getItemType() != null ? itemType.getItemType() : "";
        String sanitizedTypeName = typeName.replaceAll("\\s+", " ").trim();

        if (sanitizedTypeName.isEmpty()) {
            return ResponseEntity.badRequest().body("Item Type cannot be empty!");
        }

        Optional<ProductItemType> existing = repository.findByGroupIdAndItemType(itemType.getGroup().getId(), sanitizedTypeName);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Item Type already exists under this Group!");
        }

        itemType.setItemType(sanitizedTypeName);
        return ResponseEntity.ok(repository.save(itemType));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Product Item Type", description = "Updates an existing product item type")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProductItemType details) {
        log.info("Updating product item type ID {}: {}", id, details);

        if (details.getGroup() == null || details.getGroup().getId() == null) {
            return ResponseEntity.badRequest().body("Item Group must be selected!");
        }

        String typeName = details.getItemType() != null ? details.getItemType() : "";
        String sanitizedTypeName = typeName.replaceAll("\\s+", " ").trim();

        if (sanitizedTypeName.isEmpty()) {
            return ResponseEntity.badRequest().body("Item Type cannot be empty!");
        }

        Optional<ProductItemType> existing = repository.findByGroupIdAndItemType(details.getGroup().getId(), sanitizedTypeName);
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            return ResponseEntity.badRequest().body("Item Type already exists under this Group!");
        }

        return repository.findById(id)
                .map(itemType -> {
                    itemType.setGroup(details.getGroup());
                    itemType.setItemType(sanitizedTypeName);
                    itemType.setGroupPrefix(details.getGroupPrefix());
                    itemType.setItemPrefix(details.getItemPrefix());
                    itemType.setIsAutoGenerateCode(details.getIsAutoGenerateCode());
                    itemType.setPrefixBased(details.getPrefixBased());
                    itemType.setStatus(details.getStatus());
                    itemType.setUpdatedBy(details.getUpdatedBy());
                    return ResponseEntity.ok(repository.save(itemType));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Product Item Type", description = "Deletes a product item type by its ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting product item type ID: {}", id);
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
