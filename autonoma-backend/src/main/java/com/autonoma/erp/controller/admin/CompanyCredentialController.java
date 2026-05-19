package com.autonoma.erp.controller.admin;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.admin.CompanyCredential;
import com.autonoma.erp.service.FileService;
import com.autonoma.erp.service.admin.CompanyCredentialService;

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

@RestController
@RequestMapping("/api/company-profile")
@CrossOrigin(origins = "*")
public class CompanyCredentialController {

    @Autowired
    private CompanyCredentialService service;

    @Autowired
    private FileService fileService;

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    @GetMapping("/all")
    public ResponseEntity<List<CompanyCredential>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyCredential> getById(@PathVariable Long id) {
        Optional<CompanyCredential> result = service.findById(id);
        return result.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/create")


    @RequirePagePermission(pageCode = "AD1110", action = "write")
    public ResponseEntity<CompanyCredential> create(@RequestBody CompanyCredential company) {
        company.setCreatedDate(new Date());
        if (company.getCreatedBy() == null || company.getCreatedBy().isEmpty()) {
            company.setCreatedBy(getCurrentUserId());
        }
        return ResponseEntity.ok(service.save(company));
    }

    @PutMapping("/update/{id}")


    @RequirePagePermission(pageCode = "AD1110", action = "write")
    public ResponseEntity<CompanyCredential> update(@PathVariable Long id, @RequestBody CompanyCredential details) {
        Optional<CompanyCredential> optional = service.findById(id);
        if (optional.isPresent()) {
            CompanyCredential existing = optional.get();
            // ... copy fields logic simplified for brevity but maintaining essential
            // updates
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
            existing.setLicExpRemainderDays(details.getLicExpRemainderDays());

            if (details.getLogoFileName() != null)
                existing.setLogoFileName(details.getLogoFileName());
            if (details.getLogInBgFileName() != null)
                existing.setLogInBgFileName(details.getLogInBgFileName());

            existing.setUpdatedBy(getCurrentUserId());
            existing.setUpdatedDate(new Date());
            return ResponseEntity.ok(service.save(existing));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)


    @RequirePagePermission(pageCode = "AD1110", action = "write")
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") MultipartFile file) {
        return handleImageUpload(file, "Logo uploaded successfully");
    }

    @PostMapping(value = "/upload-bg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)


    @RequirePagePermission(pageCode = "AD1110", action = "write")
    public ResponseEntity<Map<String, String>> uploadBackground(@RequestParam("file") MultipartFile file) {
        return handleImageUpload(file, "Login background uploaded successfully");
    }

    private ResponseEntity<Map<String, String>> handleImageUpload(MultipartFile file, String successMsg) {
        try {
            // Standardize: use unified FileService to save in "Company Profile" folder
            String fullPath = fileService.saveFile(file, "COMPANY_PROFILE");
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fullPath);
            response.put("message", successMsg);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping({ "/image/{*filename}", "/image" })
    public ResponseEntity<org.springframework.core.io.Resource> getImage(
            @PathVariable(required = false) String filename,
            @RequestParam(required = false) String fileNameParam) {
        try {
            String targetFile = filename != null ? filename : fileNameParam;
            if (targetFile == null || targetFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (targetFile.startsWith("/"))
                targetFile = targetFile.substring(1);

            org.springframework.core.io.Resource resource = fileService.loadFile(targetFile);
            String contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "AD1110", action = "delete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
