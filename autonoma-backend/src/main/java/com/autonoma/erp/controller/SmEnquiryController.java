package com.autonoma.erp.controller;

import com.autonoma.erp.model.SmEnquiry;
import com.autonoma.erp.service.SmEnquiryService;
import com.autonoma.erp.repository.SmEnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autonoma.erp.security.RequirePagePermission;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/sm/enquiry")
@CrossOrigin(origins = "*")
@Tag(name = "SM - Enquiry", description = "Endpoints for managing Sales & Marketing Enquiries with OCR")
public class SmEnquiryController {

    @Autowired
    private SmEnquiryService enquiryService;

    @Autowired
    private SmEnquiryRepository enquiryRepository;

    @Operation(summary = "Get all enquiries")
    @GetMapping
    public List<SmEnquiry> getAllEnquiries() {
        return enquiryService.getAllEnquiries();
    }

    @Operation(summary = "Get enquiry by ID")
    @GetMapping("/{id}")
    public ResponseEntity<SmEnquiry> getEnquiryById(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new enquiry")
    @RequirePagePermission(pageCode = "SM1120", action = "write")
    @PostMapping
    public ResponseEntity<SmEnquiry> createEnquiry(@RequestBody SmEnquiry enquiry) {
        return ResponseEntity.ok(enquiryService.saveEnquiry(enquiry));
    }

    @Operation(summary = "Update an existing enquiry")
    @RequirePagePermission(pageCode = "SM1120", action = "write")
    @PutMapping("/{id}")
    public ResponseEntity<SmEnquiry> updateEnquiry(@PathVariable Long id, @RequestBody SmEnquiry enquiryDetails) {
        return enquiryRepository.findById(id)
                .map(enquiry -> {
                    enquiry.setEnquiryNo(enquiryDetails.getEnquiryNo());
                    enquiry.setEnquiryDate(enquiryDetails.getEnquiryDate());
                    enquiry.setCustomerName(enquiryDetails.getCustomerName());
                    enquiry.setContactPerson(enquiryDetails.getContactPerson());
                    enquiry.setEmail(enquiryDetails.getEmail());
                    enquiry.setPhone(enquiryDetails.getPhone());
                    enquiry.setSubject(enquiryDetails.getSubject());
                    enquiry.setRequirements(enquiryDetails.getRequirements());
                    enquiry.setSource(enquiryDetails.getSource());
                    enquiry.setPriority(enquiryDetails.getPriority());
                    enquiry.setOcrDocumentPath(enquiryDetails.getOcrDocumentPath());
                    enquiry.setOcrExtractedText(enquiryDetails.getOcrExtractedText());
                    enquiry.setOcrConfidence(enquiryDetails.getOcrConfidence());
                    enquiry.setStatus(enquiryDetails.getStatus());
                    enquiry.setRemarks(enquiryDetails.getRemarks());
                    enquiry.setUpdatedBy(com.autonoma.erp.util.SecurityUtils.getCurrentUserId());
                    return ResponseEntity.ok(enquiryRepository.save(enquiry));
                }).orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete an enquiry")
    @RequirePagePermission(pageCode = "SM1120", action = "delete")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnquiry(@PathVariable Long id) {
        enquiryService.deleteEnquiry(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get dashboard statistics for enquiries")
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnquiries", enquiryService.countAll());
        stats.put("openEnquiries", enquiryService.countByStatus("Open"));
        stats.put("closedEnquiries", enquiryService.countByStatus("Closed"));
        stats.put("inProgressEnquiries", enquiryService.countByStatus("In Progress"));
        return ResponseEntity.ok(stats);
    }
}

