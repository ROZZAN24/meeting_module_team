package com.autonoma.erp.controller;

import com.autonoma.erp.model.SmQuotation;
import com.autonoma.erp.service.SmQuotationService;
import com.autonoma.erp.repository.SmQuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/sm/quotation")
@CrossOrigin(origins = "*")
@Tag(name = "SM - Quotation", description = "Endpoints for managing Sales & Marketing Quotations with OCR")
public class SmQuotationController {

    @Autowired
    private SmQuotationService quotationService;

    @Autowired
    private SmQuotationRepository quotationRepository;

    @Operation(summary = "Get all quotations")
    @GetMapping
    public List<SmQuotation> getAllQuotations() {
        return quotationService.getAllQuotations();
    }

    @Operation(summary = "Get quotation by ID")
    @GetMapping("/{id}")
    public ResponseEntity<SmQuotation> getQuotationById(@PathVariable Long id) {
        return quotationService.getQuotationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new quotation")
    @PostMapping
    public ResponseEntity<?> createQuotation(@RequestBody SmQuotation quotation) {
        if (quotationRepository.existsByQuotationNo(quotation.getQuotationNo())) {
            return ResponseEntity.badRequest().body("Quotation Number already exists!");
        }
        return ResponseEntity.ok(quotationService.saveQuotation(quotation));
    }

    @Operation(summary = "Update an existing quotation")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuotation(@PathVariable Long id, @RequestBody SmQuotation quotationDetails) {
        if (quotationRepository.existsByQuotationNoAndIdNot(quotationDetails.getQuotationNo(), id)) {
            return ResponseEntity.badRequest().body("Quotation Number already exists!");
        }
        return quotationRepository.findById(id)
                .map(quotation -> {
                    quotation.setQuotationNo(quotationDetails.getQuotationNo());
                    quotation.setQuotationDate(quotationDetails.getQuotationDate());
                    quotation.setEnquiryRef(quotationDetails.getEnquiryRef());
                    quotation.setCustomerName(quotationDetails.getCustomerName());
                    quotation.setContactPerson(quotationDetails.getContactPerson());
                    quotation.setProductName(quotationDetails.getProductName());
                    quotation.setDescription(quotationDetails.getDescription());
                    quotation.setQuantity(quotationDetails.getQuantity());
                    quotation.setUnitPrice(quotationDetails.getUnitPrice());
                    quotation.setTotalAmount(quotationDetails.getTotalAmount());
                    quotation.setCurrency(quotationDetails.getCurrency());
                    quotation.setValidityPeriod(quotationDetails.getValidityPeriod());
                    quotation.setDeliveryTerms(quotationDetails.getDeliveryTerms());
                    quotation.setPaymentTerms(quotationDetails.getPaymentTerms());
                    quotation.setOcrDocumentPath(quotationDetails.getOcrDocumentPath());
                    quotation.setOcrExtractedText(quotationDetails.getOcrExtractedText());
                    quotation.setOcrConfidence(quotationDetails.getOcrConfidence());
                    quotation.setStatus(quotationDetails.getStatus());
                    quotation.setRemarks(quotationDetails.getRemarks());
                    quotation.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                    quotation.setUpdatedDate(new java.util.Date());
                    return ResponseEntity.ok(quotationRepository.save(quotation));
                }).orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a quotation")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable Long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.ok().build();
    }
}
