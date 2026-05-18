package com.autonoma.erp.service;

import com.autonoma.erp.model.admin.AppPreference;
import com.autonoma.erp.model.admin.CompanyCredential;
import com.autonoma.erp.repository.admin.AppPreferenceRepository;
import com.autonoma.erp.repository.admin.CompanyCredentialRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import AppUtil.BosDocConstants;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private CompanyCredentialRepository companyRepo;

    @Autowired
    private AppPreferenceRepository prefRepo;

    /**
     * Resolves the root upload directory based on configuration.
     * 1. Check Company Profile settings (directoryPath)
     * 2. Check App Preferences (FILE_LOCATION)
     * 3. Fallback to local 'uploads' directory
     */
    public Path getRootPath() {
        Path resolvedPath = null;
        String os = System.getProperty("os.name").toLowerCase();

        // Priority 1: From Company Profile
        try {
            List<CompanyCredential> companies = companyRepo.findAll();
            if (!companies.isEmpty()) {
                String pathStr = companies.get(0).getDirectoryPath();
                if (pathStr != null && !pathStr.trim().isEmpty()) {
                    resolvedPath = Paths.get(pathStr.trim());
                }
            }
        } catch (Exception e) {
            // Log and fallback
        }

        // Priority 2: From App Preferences
        if (resolvedPath == null) {
            try {
                Optional<AppPreference> pref = prefRepo.findByPrefName("FILE_LOCATION");
                if (pref.isPresent() && pref.get().getPrefValue() != null
                        && !pref.get().getPrefValue().trim().isEmpty()) {
                    resolvedPath = Paths.get(pref.get().getPrefValue().trim());
                }
            } catch (Exception e) {
                // Log and fallback
            }
        }

        // Standardize the document root path based on OS
<<<<<<< HEAD
        if (resolvedPath == null || resolvedPath.toString().contains("BOS_DOCUMENTS")) {
            if (os.contains("win")) {
                resolvedPath = Paths.get("D:\\BOS_DOCUMENTS").toAbsolutePath();
            } else {
                // On Mac/Linux, we use a clean folder name without Windows drive letters
                resolvedPath = Paths.get("BOS_DOCUMENTS").toAbsolutePath();
            }
=======
        if (os.contains("win")) {
            if (resolvedPath == null || !resolvedPath.isAbsolute() || resolvedPath.toString().contains("BOS_DOCUMENTS")) {
                resolvedPath = Paths.get("D:\\BOS_DOCUMENTS").toAbsolutePath();
            }
        } else {
            // On Mac/Linux, ignore Windows paths completely and place BOS_DOCUMENTS inside the autonoma-backend folder
            resolvedPath = Paths.get("BOS_DOCUMENTS").toAbsolutePath().normalize();
>>>>>>> origin/main
        }

        // Ensure root directory exists
        try {
            if (!Files.exists(resolvedPath)) {
                Files.createDirectories(resolvedPath);
            }
        } catch (IOException e) {
<<<<<<< HEAD
            // Fallback to a guaranteed temp dir if creation fails
            resolvedPath = Paths.get(System.getProperty("java.io.tmpdir"), "BOS_DOCUMENTS");
=======
            if (os.contains("win")) {
                resolvedPath = Paths.get(System.getProperty("java.io.tmpdir"), "BOS_DOCUMENTS");
            } else {
                resolvedPath = Paths.get(System.getProperty("user.home"), "BOS_DOCUMENTS");
                try {
                    Files.createDirectories(resolvedPath);
                } catch (IOException ex) {
                    resolvedPath = Paths.get(System.getProperty("java.io.tmpdir"), "BOS_DOCUMENTS");
                }
            }
>>>>>>> origin/main
        }

        return resolvedPath;
    }

    /**
     * Saves a file into a module-specific subdirectory.
     * 
     * @param file   - The multipart file
     * @param module - The module name (mapped via BosDocConstants)
     * @returns The relative path (e.g. "QMS/uuid_name.pdf")
     */
    public String saveFile(MultipartFile file, String module) throws IOException {
        String subDir = resolveSubDir(module);
        Path rootPath = getRootPath();
        Path targetDir = rootPath.resolve(subDir);

        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetPath = targetDir.resolve(fileName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return subDir + "/" + fileName;
    }

    /**
     * Resolves a file for viewing/downloading.
     * 
     * @param relativePath - The path including module (e.g. "QMS/uuid_name.pdf")
     */
    public Resource loadFile(String relativePath) throws MalformedURLException {
        Path file = getRootPath().resolve(relativePath).normalize();
        Resource resource = new UrlResource(file.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
<<<<<<< HEAD
        } else {
            throw new RuntimeException("File not found: " + relativePath);
        }
=======
        }

        // Fuzzy space and encoding resolution
        try {
            Path parentDir = file.getParent();
            if (parentDir != null && Files.exists(parentDir)) {
                String targetNameNormalized = file.getFileName().toString().replaceAll("[\\s\\u202f\\u00a0?]+", " ");
                try (java.util.stream.Stream<Path> stream = Files.list(parentDir)) {
                    java.util.Optional<Path> found = stream
                        .filter(p -> {
                            String name = p.getFileName().toString().replaceAll("[\\s\\u202f\\u00a0?]+", " ");
                            return name.equalsIgnoreCase(targetNameNormalized);
                        })
                        .findFirst();
                    if (found.isPresent()) {
                        file = found.get();
                        resource = new UrlResource(file.toUri());
                        if (resource.exists() || resource.isReadable()) {
                            return resource;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Fallback to throw exception
        }

        throw new RuntimeException("File not found: " + relativePath);
>>>>>>> origin/main
    }

    /**
     * Deletes a file based on its relative path.
     */
    public boolean deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isEmpty())
            return false;
        try {
            Path file = getRootPath().resolve(relativePath).normalize();
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Maps module strings to BosDocConstants.
     * Supports both top-level modules and sub-module granularity.
     */
    private String resolveSubDir(String module) {
        if (module == null)
            return BosDocConstants.DEFAULT_DOC_PATH;

        switch (module.toUpperCase()) {
            // ─── Top-level module paths ─────────────────────────
            case "QMS":
                return BosDocConstants.QMS_DOC_PATH;
            case "HRA":
                return BosDocConstants.HRA_DOC_PATH;
            case "FINANCE":
                return BosDocConstants.FINANCE_DOC_PATH;
            case "PRODUCTION":
                return BosDocConstants.PRODUCTION_DOC_PATH;
            case "PURCHASE":
                return BosDocConstants.PURCHASE_DOC_PATH;
            case "SALES":
                return BosDocConstants.SALES_DOC_PATH;
            case "MAINTENANCE":
                return BosDocConstants.MAINTENANCE_DOC_PATH;
            case "QUALITY":
                return BosDocConstants.QUALITY_DOC_PATH;
            case "ASSETS":
                return BosDocConstants.ASSETS_DOC_PATH;
            case "NPD":
                return BosDocConstants.NPD_DOC_PATH;
            case "STORES":
                return BosDocConstants.STORES_DOC_PATH;
            case "OCR":
                return BosDocConstants.OCR_DOC_PATH;
            case "USER_PROFILE":
                return BosDocConstants.USER_PROFILE_DOC_PATH;
            case "COMPANY_PROFILE":
                return BosDocConstants.COMPANY_PROFILE_PATH;

            // ─── HRA sub-module paths ───────────────────────────
            case "HRA_PROFILE":
                return BosDocConstants.HRA_EMPLOYEE_PROFILE_PATH;
            case "HRA_KYC":
                return BosDocConstants.HRA_EMPLOYEE_KYC_PATH;
            case "HRA_EDUCATION":
                return BosDocConstants.HRA_EMPLOYEE_EDUCATION_PATH;
            case "HRA_FITNESS":
                return BosDocConstants.HRA_EMPLOYEE_FITNESS_PATH;
            case "HRA_NDA":
                return BosDocConstants.HRA_EMPLOYEE_NDA_PATH;
            case "HRA_SIGNATURE":
                return BosDocConstants.HRA_EMPLOYEE_SIGNATURE_PATH;

            // ─── QMS sub-module paths ───────────────────────────
            case "QMS_CHECKLIST":
                return BosDocConstants.QMS_CHECKLIST_PATH;
            case "QMS_AUDIT":
                return BosDocConstants.QMS_AUDIT_PATH;
            case "QMS_NCR":
                return BosDocConstants.QMS_NCR_PATH;

            // ─── Sales sub-module paths ─────────────────────────
            case "SALES_CUSTOMER":
                return BosDocConstants.SALES_CUSTOMER_PATH;
            case "SALES_ENQUIRY":
                return BosDocConstants.SALES_ENQUIRY_PATH;
            case "SALES_QUOTATION":
                return BosDocConstants.SALES_QUOTATION_PATH;

            default:
                return BosDocConstants.DEFAULT_DOC_PATH;
        }
    }
}
