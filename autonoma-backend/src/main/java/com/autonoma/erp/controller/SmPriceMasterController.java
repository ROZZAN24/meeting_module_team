package com.autonoma.erp.controller;

import com.autonoma.erp.model.SmPriceMaster;
import com.autonoma.erp.service.SmPriceMasterService;
import com.autonoma.erp.repository.SmPriceMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/sm/price-master")
@CrossOrigin(origins = "*")
@Tag(name = "SM - Price Master", description = "Endpoints for managing Sales & Marketing Price Master with OCR")
public class SmPriceMasterController {

    @Autowired
    private SmPriceMasterService priceMasterService;

    @Autowired
    private SmPriceMasterRepository priceMasterRepository;

    @Operation(summary = "Get all price masters")
    @GetMapping
    public List<SmPriceMaster> getAllMasters() {
        return priceMasterService.getAllMasters();
    }

    @Operation(summary = "Get price master by ID")
    @GetMapping("/{id}")
    public ResponseEntity<SmPriceMaster> getMasterById(@PathVariable Long id) {
        return priceMasterService.getMasterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new price master")
    @RequirePagePermission(pageCode = "SM1130", action = "write")
    @PostMapping
    public ResponseEntity<SmPriceMaster> createMaster(@RequestBody SmPriceMaster master) {
        return ResponseEntity.ok(priceMasterService.saveMaster(master));
    }

    @Operation(summary = "Update an existing price master")
    @RequirePagePermission(pageCode = "SM1130", action = "write")
    @PutMapping("/{id}")
    public ResponseEntity<SmPriceMaster> updateMaster(@PathVariable Long id, @RequestBody SmPriceMaster masterDetails) {
        return priceMasterRepository.findById(id)
                .map(master -> {
                    master.setMasterNo(masterDetails.getMasterNo());
                    master.setEntryDate(masterDetails.getEntryDate());
                    master.setCustomerName(masterDetails.getCustomerName());
                    master.setCustomer(masterDetails.getCustomer());
                    master.setProductName(masterDetails.getProductName());
                    master.setUnitPrice(masterDetails.getUnitPrice());
                    master.setQuantity(masterDetails.getQuantity());
                    master.setCurrency(masterDetails.getCurrency());
                    master.setValidFrom(masterDetails.getValidFrom());
                    master.setValidTo(masterDetails.getValidTo());
                    master.setTermsAndConditions(masterDetails.getTermsAndConditions());
                    master.setOcrDocumentPath(masterDetails.getOcrDocumentPath());
                    master.setOcrExtractedText(masterDetails.getOcrExtractedText());
                    master.setOcrConfidence(masterDetails.getOcrConfidence());
                    master.setStatus(masterDetails.getStatus());
                    master.setRemarks(masterDetails.getRemarks());
                    master.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                    return ResponseEntity.ok(priceMasterRepository.save(master));
                }).orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a price master")
    @RequirePagePermission(pageCode = "SM1130", action = "delete")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaster(@PathVariable Long id) {
        priceMasterService.deleteMaster(id);
        return ResponseEntity.ok().build();
    }
}

