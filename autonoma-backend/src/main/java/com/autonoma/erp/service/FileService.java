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
     *
     * Priority order:
     *  1. Company Profile → directoryPath  (License & Configuration field)
     *  2. App Preferences → FILE_LOCATION
     *  3. OS-specific fallback (BOS_DOCUMENTS next to autonoma-backend on Mac/Linux, D:\BOS_DOCUMENTS on Windows)
     */
    public Path getRootPath() {
        String os = System.getProperty("os.name").toLowerCase();
        Path resolvedPath = null;

        // ── Priority 1: Company Profile directoryPath ──────────────────────
        try {
            List<CompanyCredential> companies = companyRepo.findAll();
            if (!companies.isEmpty()) {
                String pathStr = companies.get(0).getDirectoryPath();
                if (pathStr != null && !pathStr.trim().isEmpty()) {
                    resolvedPath = sanitizePath(pathStr.trim(), os);
                }
            }
        } catch (Exception ignored) { }

        // ── Priority 2: App Preferences FILE_LOCATION ──────────────────────
        if (resolvedPath == null) {
            try {
                Optional<AppPreference> pref = prefRepo.findByPrefName("FILE_LOCATION");
                if (pref.isPresent() && pref.get().getPrefValue() != null
                        && !pref.get().getPrefValue().trim().isEmpty()) {
                    resolvedPath = sanitizePath(pref.get().getPrefValue().trim(), os);
                }
            } catch (Exception ignored) { }
        }

        // ── Priority 3: OS-specific fallback ───────────────────────────────
        if (resolvedPath == null) {
            if (os.contains("win")) {
                resolvedPath = Paths.get("D:\\BOS_DOCUMENTS").toAbsolutePath();
            } else if (Files.exists(Paths.get("autonoma-backend"))) {
                resolvedPath = Paths.get("autonoma-backend/BOS_DOCUMENTS").toAbsolutePath().normalize();
            } else {
                resolvedPath = Paths.get("BOS_DOCUMENTS").toAbsolutePath().normalize();
            }
        }

        // ── Ensure directory exists ─────────────────────────────────────────
        try {
            Files.createDirectories(resolvedPath);
        } catch (IOException e) {
            resolvedPath = Paths.get(System.getProperty("java.io.tmpdir"), "BOS_DOCUMENTS");
            try { Files.createDirectories(resolvedPath); } catch (IOException ignored) { }
        }

        return resolvedPath;
    }


    /**
     * Converts a configured path string into a usable absolute Path.
     * Handles cross-platform scenarios: Windows paths used on Mac/Linux have
     * their drive letter stripped so BOS_DOCUMENTS resolves correctly.
     */
    private Path sanitizePath(String pathStr, String os) {
        if (!os.contains("win") && pathStr.matches("^[A-Za-z]:[/\\\\].*")) {
            // Strip Windows drive letter (e.g. "D:\\BOS_DOCUMENTS" → "BOS_DOCUMENTS")
            String stripped = pathStr.replaceFirst("^[A-Za-z]:[/\\\\]+", "");
            stripped = stripped.replace("\\\\", "/").replace("\\", "/");
            return Paths.get(stripped).toAbsolutePath().normalize();
        }
        pathStr = pathStr.replace("\\\\", java.io.File.separator).replace("\\", java.io.File.separator);
        return Paths.get(pathStr).toAbsolutePath().normalize();
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
     * Handles two path formats stored in DB:
     *  - Relative (new):  "QMS/Checklist/uuid_file.pdf"  → resolved under getRootPath()
     *  - Absolute (legacy): "D:\\BOS_DOCUMENTS\\Master\\QMS\\..." → used directly (sanitized for OS)
     *
     * @param relativePath - The path as stored in the DB
     */
    public Resource loadFile(String relativePath) throws MalformedURLException {
        String os = System.getProperty("os.name").toLowerCase();
        Path file;

        // Detect legacy absolute paths (Windows-style absolute or Unix absolute)
        boolean isAbsolute = relativePath.matches("^[A-Za-z]:[/\\\\].*") || relativePath.startsWith("/");
        if (isAbsolute) {
            // Sanitize and use directly — no root prefix
            file = sanitizePath(relativePath, os);
        } else {
            file = getRootPath().resolve(relativePath).normalize();
        }

        Resource resource = new UrlResource(file.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
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
        } catch (Exception ignored) { }

        throw new RuntimeException("File not found: " + relativePath);
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
            case "CHAT_UPLOAD":
            case "CHAT_UPLOADS":
                return BosDocConstants.CHAT_UPLOADS_PATH;
            case "CHAT_VOICE":
            case "CHAT_VOICES":
                return BosDocConstants.CHAT_VOICES_PATH;

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

            case "SUPPORT_TEMP_ATTACHMENT":
                return "Ticketing/Temp/Attachments";
            case "SUPPORT_TEMP_VOICE":
                return "Ticketing/Temp/Voice Recordings";

            default:
                return BosDocConstants.DEFAULT_DOC_PATH;
        }
    }
}
