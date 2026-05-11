package com.autonoma.erp.controller;

import com.autonoma.erp.model.CompanyCredential;
import com.autonoma.erp.service.CompanyCredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import AppUtil.BosDocConstants;

@RestController
@RequestMapping("/api/company-profile")
@CrossOrigin(origins = "*")
public class CompanyCredentialController {

    @Autowired
    private CompanyCredentialService service;

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    // -----------------------------------------------------------------------
    // GET – Fetch all records (typically just one row for a company)
    // -----------------------------------------------------------------------
    @GetMapping("/all")
    public ResponseEntity<List<CompanyCredential>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // -----------------------------------------------------------------------
    // GET – Fetch by ID
    // -----------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<CompanyCredential> getById(@PathVariable Integer id) {
        Optional<CompanyCredential> result = service.findById(id);
        return result.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // -----------------------------------------------------------------------
    // POST – Create new company profile
    // -----------------------------------------------------------------------
    @PostMapping("/create")
    public ResponseEntity<CompanyCredential> create(@RequestBody CompanyCredential company) {
        company.setCreatedDate(new Date());
        company.setCreatedBy(getCurrentUserId());
        CompanyCredential saved = service.save(company);
        return ResponseEntity.ok(saved);
    }

    // -----------------------------------------------------------------------
    // PUT – Update existing company profile
    // -----------------------------------------------------------------------
    @PutMapping("/update/{id}")
    public ResponseEntity<CompanyCredential> update(@PathVariable Integer id,
            @RequestBody CompanyCredential details) {
        Optional<CompanyCredential> optional = service.findById(id);
        if (optional.isPresent()) {
            CompanyCredential existing = optional.get();
            existing.setCompanyName(details.getCompanyName());
            existing.setShortName(details.getShortName());
            existing.setAddress(details.getAddress());
            existing.setCity(details.getCity());
            existing.setState(details.getState());
            existing.setStateCode(details.getStateCode());
            existing.setCountry(details.getCountry());
            existing.setPincode(details.getPincode());
            existing.setGstIn(details.getGstIn());
            existing.setDbSourceName(details.getDbSourceName());
            existing.setLicRenewalDate(details.getLicRenewalDate());
            existing.setLicExpiryDate(details.getLicExpiryDate());
            existing.setDirectoryPath(details.getDirectoryPath());
            // Only overwrite image names if the caller provides them
            if (details.getLogoFileName() != null && !details.getLogoFileName().isEmpty()) {
                existing.setLogoFileName(details.getLogoFileName());
            }
            if (details.getLogInBgFileName() != null && !details.getLogInBgFileName().isEmpty()) {
                existing.setLogInBgFileName(details.getLogInBgFileName());
            }
            existing.setUpdatedBy(getCurrentUserId());
            existing.setUpdatedDate(new Date());
            return ResponseEntity.ok(service.save(existing));
        }
        return ResponseEntity.notFound().build();
    }

    // -----------------------------------------------------------------------
    // POST – Upload Logo image
    // -----------------------------------------------------------------------
    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") MultipartFile file) {
        try {
            String filename = service.saveUploadedFile(file, BosDocConstants.COMPANY_PROFILE_PATH);
            Map<String, String> response = new HashMap<>();
            response.put("fileName", filename);
            response.put("message", "Logo uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Logo upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------------------
    // POST – Upload Login Background image
    // -----------------------------------------------------------------------
    @PostMapping(value = "/upload-bg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadBackground(@RequestParam("file") MultipartFile file) {
        try {
            String filename = service.saveUploadedFile(file, BosDocConstants.COMPANY_PROFILE_PATH);
            Map<String, String> response = new HashMap<>();
            response.put("fileName", filename);
            response.put("message", "Login background uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Background upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // -----------------------------------------------------------------------
    // GET – Retrieve image
    // -----------------------------------------------------------------------
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getImage(@PathVariable String filename) {
        try {
            org.springframework.core.io.Resource resource = service.loadFileAsResource(filename, BosDocConstants.COMPANY_PROFILE_PATH);
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
            } catch (Exception ex) {
                // Ignore and fallback
            }
            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // -----------------------------------------------------------------------
    // DELETE
    // -----------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Optional<CompanyCredential> optional = service.findById(id);
        if (optional.isPresent()) {
            service.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
