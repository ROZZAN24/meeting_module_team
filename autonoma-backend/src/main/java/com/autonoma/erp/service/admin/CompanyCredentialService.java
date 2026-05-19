package com.autonoma.erp.service.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.autonoma.erp.model.admin.AppPreference;
import com.autonoma.erp.model.admin.CompanyCredential;
import com.autonoma.erp.repository.admin.AppPreferenceRepository;
import com.autonoma.erp.repository.admin.CompanyCredentialRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import AppUtil.BosDocConstants;

@Service
public class CompanyCredentialService {

    @Autowired
    private CompanyCredentialRepository repository;

    @Autowired
    private AppPreferenceRepository appPreferenceRepository;

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            java.util.List<CompanyCredential> all = repository.findAll();
            for (CompanyCredential cred : all) {
                if ("BOSDBSRC".equalsIgnoreCase(cred.getDbSourceName()) || cred.getDbSourceName() == null || cred.getDbSourceName().trim().isEmpty()) {
                    cred.setDbSourceName("AUTONOMA");
                    repository.save(cred);
                    org.slf4j.LoggerFactory.getLogger(CompanyCredentialService.class).info("[Startup] Automatically corrected legacy dbSourceName for company: {}", cred.getCompanyName());
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CompanyCredentialService.class).error("[Startup] Failed to verify/correct company credentials", e);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.clear();
        }
    }

    private Path getUploadDirectory() {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            // Priority 1: From CompanyCredential record
            List<CompanyCredential> all = repository.findAll();
            if (!all.isEmpty() && all.get(0).getDirectoryPath() != null
                    && !all.get(0).getDirectoryPath().trim().isEmpty()) {
                return Paths.get(all.get(0).getDirectoryPath().trim());
            }

            // Priority 2: From AppPreference
            Optional<AppPreference> pref = appPreferenceRepository.findByPrefName("FILE_LOCATION");
            if (pref.isPresent() && pref.get().getPrefValue() != null && !pref.get().getPrefValue().trim().isEmpty()) {
                return Paths.get(pref.get().getPrefValue().trim());
            }
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }

        // Fallback: Default uploads/company
        Path fallback = Paths
                .get(System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "company");
        org.slf4j.LoggerFactory.getLogger(CompanyCredentialService.class).info("[UploadPath] Resolved directory: {}",
                fallback.toAbsolutePath());
        return fallback;
    }

    public List<CompanyCredential> findAll() {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return repository.findAll();
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    public Optional<CompanyCredential> findById(Long id) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return repository.findById(id);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    public CompanyCredential save(CompanyCredential company) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            return repository.save(company);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    public void deleteById(Long id) {
        String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        try {
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            repository.deleteById(id);
        } finally {
            com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
        }
    }

    /**
     * Saves uploaded file to the configured directory and returns the saved
     * filename.
     */
    public String saveUploadedFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = getUploadDirectory().resolve(subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "upload";
        }

        String baseName = originalFilename;
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex != -1) {
            baseName = originalFilename.substring(0, dotIndex);
            extension = originalFilename.substring(dotIndex);
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(dtf);
        String uniqueFilename = baseName + "_" + timestamp + extension;

        Path targetPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }

    public Resource loadFileAsResource(String filename, String subDir) throws Exception {
        Path filePath = getUploadDirectory().resolve(subDir).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }
}
