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
            // ─── 3-Level Menu Hierarchical Mappings ────────────────────────

            // --- MASTER Module ---
            case "MASTER_HR_EMPLOYEE_EMPLOYEE_MASTER":
            case "HRA_PROFILE":
            case "HRA_KYC":
            case "HRA_EDUCATION":
            case "HRA_FITNESS":
            case "HRA_NDA":
            case "HRA_SIGNATURE":
                return BosDocConstants.MASTER_HR_EMPLOYEE_EMPLOYEE_MASTER_PATH;
            case "MASTER_HR_ATS_APPLICATION_TRACKING_SYSTEM":
                return BosDocConstants.MASTER_HR_ATS_APPLICATION_TRACKING_SYSTEM_PATH;
            case "MASTER_HR_ATS_INTERVIEW_CRITERIA_MASTER":
                return BosDocConstants.MASTER_HR_ATS_INTERVIEW_CRITERIA_MASTER_PATH;
            case "MASTER_HR_ATS_EMAIL_CONTENT_MASTER":
                return BosDocConstants.MASTER_HR_ATS_EMAIL_CONTENT_MASTER_PATH;
            case "MASTER_HR_ATS_APPLICANT_VERIFICATION_CRITERIA":
                return BosDocConstants.MASTER_HR_ATS_APPLICANT_VERIFICATION_CRITERIA_PATH;
            case "MASTER_HR_ATS_INDUCTION_CRITERIA":
                return BosDocConstants.MASTER_HR_ATS_INDUCTION_CRITERIA_PATH;
            case "MASTER_HR_EMPLOYEE_EMPLOYEE_TYPE":
                return BosDocConstants.MASTER_HR_EMPLOYEE_EMPLOYEE_TYPE_PATH;
            case "MASTER_HR_EMPLOYEE_DEPARTMENT":
                return BosDocConstants.MASTER_HR_EMPLOYEE_DEPARTMENT_PATH;
            case "MASTER_HR_EMPLOYEE_DESIGNATION":
                return BosDocConstants.MASTER_HR_EMPLOYEE_DESIGNATION_PATH;
            case "MASTER_HR_EMPLOYEE_LEVEL":
                return BosDocConstants.MASTER_HR_EMPLOYEE_LEVEL_PATH;
            case "MASTER_HR_EMPLOYEE_GRADE":
                return BosDocConstants.MASTER_HR_EMPLOYEE_GRADE_PATH;
            case "MASTER_HR_EMPLOYEE_EMPLOYEE_SATISFACTION_CRITERIA":
                return BosDocConstants.MASTER_HR_EMPLOYEE_EMPLOYEE_SATISFACTION_CRITERIA_PATH;
            case "MASTER_HR_PAYROLL_HOLIDAY":
                return BosDocConstants.MASTER_HR_PAYROLL_HOLIDAY_PATH;
            case "MASTER_HR_PAYROLL_BANK_DETAILS":
                return BosDocConstants.MASTER_HR_PAYROLL_BANK_DETAILS_PATH;
            case "MASTER_HR_PAYROLL_SHIFT":
                return BosDocConstants.MASTER_HR_PAYROLL_SHIFT_PATH;
            case "MASTER_HR_PAYROLL_LOAN_MASTER":
                return BosDocConstants.MASTER_HR_PAYROLL_LOAN_MASTER_PATH;
            case "MASTER_HR_PAYROLL_LEAVE_MASTER":
                return BosDocConstants.MASTER_HR_PAYROLL_LEAVE_MASTER_PATH;
            case "MASTER_HR_PAYROLL_PERMISSION_MASTER":
                return BosDocConstants.MASTER_HR_PAYROLL_PERMISSION_MASTER_PATH;
            case "MASTER_HR_PAYROLL_PETROL_ALLOWANCE":
                return BosDocConstants.MASTER_HR_PAYROLL_PETROL_ALLOWANCE_PATH;
            case "MASTER_HR_PAYROLL_POLICY_MASTER":
                return BosDocConstants.MASTER_HR_PAYROLL_POLICY_MASTER_PATH;

            case "MASTER_QMS_CHECKLIST_CHECK_LIST_MASTER":
                return BosDocConstants.MASTER_QMS_CHECKLIST_CHECK_LIST_MASTER_PATH;
            case "MASTER_QMS_AUDIT_AUDIT_AREA_ZONE":
                return BosDocConstants.MASTER_QMS_AUDIT_AUDIT_AREA_ZONE_PATH;
            case "MASTER_QMS_AUDIT_AUDIT_TYPE":
                return BosDocConstants.MASTER_QMS_AUDIT_AUDIT_TYPE_PATH;
            case "MASTER_QMS_AUDIT_AUDIT_CRITERIA":
                return BosDocConstants.MASTER_QMS_AUDIT_AUDIT_CRITERIA_PATH;
            case "MASTER_QMS_MEETING_MEETING_MASTER":
            case "MEETING_MASTER":
                return BosDocConstants.MASTER_QMS_MEETING_MEETING_MASTER_PATH;
            case "MASTER_QMS_MEETING_UNNAMED_PAGE":
                return BosDocConstants.MASTER_QMS_MEETING_UNNAMED_PAGE_PATH;

            case "MASTER_NPD_PRODUCT_PRODUCT_ITEM_GROUP":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_ITEM_GROUP_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_ITEM_TYPE":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_ITEM_TYPE_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_ITEM_SUB_TYPE":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_ITEM_SUB_TYPE_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_OEM_MASTER":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_OEM_MASTER_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_OEM_MAPPING":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_OEM_MAPPING_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_MODEL_MASTER":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_MODEL_MASTER_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_CAPACITY_MASTER":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_CAPACITY_MASTER_PATH;
            case "MASTER_NPD_PRODUCT_PRODUCT_PROCESS_MASTER":
                return BosDocConstants.MASTER_NPD_PRODUCT_PRODUCT_PROCESS_MASTER_PATH;
            case "MASTER_NPD_WIND_FARM_MASTER":
                return BosDocConstants.MASTER_NPD_WIND_FARM_MASTER_PATH;
            case "MASTER_NPD_UOM":
                return BosDocConstants.MASTER_NPD_UOM_PATH;

            case "MASTER_VENDOR_MASTER":
            case "SALES_SUPPLIER":
            case "SALES_SUPPLIERS":
                return BosDocConstants.MASTER_VENDOR_MASTER_PATH;

            case "MASTER_SALES_CRM_CUSTOMER_SATISFACTION_CRITERIA":
                return BosDocConstants.MASTER_SALES_CRM_CUSTOMER_SATISFACTION_CRITERIA_PATH;
            case "MASTER_SALES_CRM_CONTACT_MASTER":
                return BosDocConstants.MASTER_SALES_CRM_CONTACT_MASTER_PATH;
            case "MASTER_SALES_CRM_CUSTOMER_MASTER":
            case "SALES_CUSTOMER":
                return BosDocConstants.MASTER_SALES_CRM_CUSTOMER_MASTER_PATH;
            case "MASTER_SALES_CRM_CUSTOMER_POTENTIAL":
                return BosDocConstants.MASTER_SALES_CRM_CUSTOMER_POTENTIAL_PATH;

            case "MASTER_SALES_LOGISTICS_PAYMENT_TERMS":
                return BosDocConstants.MASTER_SALES_LOGISTICS_PAYMENT_TERMS_PATH;
            case "MASTER_SALES_LOGISTICS_DELIVERY_TERMS":
                return BosDocConstants.MASTER_SALES_LOGISTICS_DELIVERY_TERMS_PATH;
            case "MASTER_SALES_LOGISTICS_CURRENCY":
                return BosDocConstants.MASTER_SALES_LOGISTICS_CURRENCY_PATH;
            case "MASTER_SALES_LOGISTICS_UNIT_OF_MEASUREMENT":
                return BosDocConstants.MASTER_SALES_LOGISTICS_UNIT_OF_MEASUREMENT_PATH;
            case "MASTER_SALES_LOGISTICS_COUNTRY_MASTER":
                return BosDocConstants.MASTER_SALES_LOGISTICS_COUNTRY_MASTER_PATH;
            case "MASTER_SALES_LOGISTICS_STATE_MASTER":
                return BosDocConstants.MASTER_SALES_LOGISTICS_STATE_MASTER_PATH;
            case "MASTER_SALES_LOGISTICS_SEGMENT":
                return BosDocConstants.MASTER_SALES_LOGISTICS_SEGMENT_PATH;
            case "MASTER_SALES_LOGISTICS_SUB_SEGMENT":
                return BosDocConstants.MASTER_SALES_LOGISTICS_SUB_SEGMENT_PATH;
            case "MASTER_SALES_LOGISTICS_MODE_OF_DESPATCH":
                return BosDocConstants.MASTER_SALES_LOGISTICS_MODE_OF_DESPATCH_PATH;
            case "MASTER_SALES_LOGISTICS_FREIGHT":
                return BosDocConstants.MASTER_SALES_LOGISTICS_FREIGHT_PATH;

            // --- HRA Module ---
            case "HRA_INDUCTION_INDUCTION_PENDING":
                return BosDocConstants.HRA_INDUCTION_INDUCTION_PENDING_PATH;
            case "HRA_INDUCTION_INDUCTION_TRAINING":
                return BosDocConstants.HRA_INDUCTION_INDUCTION_TRAINING_PATH;
            case "HRA_INDUCTION_INDUCTION_TRAINEE":
                return BosDocConstants.HRA_INDUCTION_INDUCTION_TRAINEE_PATH;

            // --- SALES & MARKETING Module ---
            case "SALES_MARKETING_OCR_ENQUIRY_DASHBOARD":
                return BosDocConstants.SALES_MARKETING_OCR_ENQUIRY_DASHBOARD_PATH;
            case "SALES_MARKETING_OCR_ENQUIRY":
            case "SALES_ENQUIRY":
                return BosDocConstants.SALES_MARKETING_OCR_ENQUIRY_PATH;
            case "SALES_MARKETING_OCR_PRICE_MASTER":
                return BosDocConstants.SALES_MARKETING_OCR_PRICE_MASTER_PATH;
            case "SALES_MARKETING_OCR_QUOTATION":
            case "SALES_QUOTATION":
                return BosDocConstants.SALES_MARKETING_OCR_QUOTATION_PATH;

            // --- QUALITY MANAGEMENT SYSTEMS Module ---
            case "QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_VERIFY":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_VERIFY_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CLOSE_CHECKLIST_RENEWAL":
            case "QMS_CHECKLIST":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CLOSE_CHECKLIST_RENEWAL_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_RENEWAL_VERIFY":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_RENEWAL_VERIFY_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_RENEWAL_REPORT":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_CHECKLIST_CHECKLIST_RENEWAL_REPORT_PATH;

            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_SCHEDULE":
            case "QMS_AUDIT":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_SCHEDULE_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_USER_ATTENDANCE":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_USER_ATTENDANCE_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_OBSERVATION":
            case "QMS_AUDIT_OBSERVATION":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_OBSERVATION_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_CLOSE_NC_OFI":
            case "QMS_NCR":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_CLOSE_NC_OFI_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_NC_OFI_APPROVAL":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_NC_OFI_APPROVAL_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_REPORT":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_AUDIT_AUDIT_REPORT_PATH;

            case "QUALITY_MANAGEMENT_SYSTEMS_MEETING_MEETING_SCHEDULE":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_MEETING_MEETING_SCHEDULE_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_MEETING_MEETING_USER_ATTENDANCE":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_MEETING_MEETING_USER_ATTENDANCE_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_MEETING_MINUTES_OF_MEETING":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_MEETING_MINUTES_OF_MEETING_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_MEETING_CLOSE_MOM":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_MEETING_CLOSE_MOM_PATH;
            case "QUALITY_MANAGEMENT_SYSTEMS_MEETING_MOM_APPROVAL":
                return BosDocConstants.QUALITY_MANAGEMENT_SYSTEMS_MEETING_MOM_APPROVAL_PATH;

            // --- ADMIN Module ---
            case "ADMIN_BOS_COMPANY_PROFILE":
            case "COMPANY_PROFILE":
                return BosDocConstants.ADMIN_BOS_COMPANY_PROFILE_PATH;
            case "ADMIN_BOS_DIVISIONS_UNITS":
                return BosDocConstants.ADMIN_BOS_DIVISIONS_UNITS_PATH;
            case "ADMIN_BOS_USER_CREDENTIALS":
            case "USER_PROFILE":
                return BosDocConstants.ADMIN_BOS_USER_CREDENTIALS_PATH;
            case "ADMIN_BOS_USER_ACCESS":
                return BosDocConstants.ADMIN_BOS_USER_ACCESS_PATH;
            case "ADMIN_BOS_AUDIT_TRAIL":
                return BosDocConstants.ADMIN_BOS_AUDIT_TRAIL_PATH;
            case "ADMIN_BOS_USER_SESSION_ANALYTICS":
                return BosDocConstants.ADMIN_BOS_USER_SESSION_ANALYTICS_PATH;
            case "ADMIN_BOS_FILE_TRACEABILITY_HUB":
            case "TRACEABILITY":
                return BosDocConstants.ADMIN_BOS_FILE_TRACEABILITY_HUB_PATH;
            case "ADMIN_BOS_OLD_DATA_MIGRATION":
                return BosDocConstants.ADMIN_BOS_OLD_DATA_MIGRATION_PATH;
            case "ADMIN_BOS_ORGANIZATION_CHART":
                return BosDocConstants.ADMIN_BOS_ORGANIZATION_CHART_PATH;

            case "ADMIN_SUPER_BUSINESS_AUTHORIZATION":
                return BosDocConstants.ADMIN_SUPER_BUSINESS_AUTHORIZATION_PATH;
            case "ADMIN_SUPER_APP_PREFERENCE":
                return BosDocConstants.ADMIN_SUPER_APP_PREFERENCE_PATH;
            case "ADMIN_SUPER_PREFIX_SUFFIX_CREDENTIALS":
                return BosDocConstants.ADMIN_SUPER_PREFIX_SUFFIX_CREDENTIALS_PATH;
            case "ADMIN_SUPER_SESSION_MONITORING":
                return BosDocConstants.ADMIN_SUPER_SESSION_MONITORING_PATH;

            // --- DASHBOARD Module ---
            case "DASHBOARD_CHAT_UPLOADS":
            case "CHAT_UPLOAD":
            case "CHAT_UPLOADS":
                return BosDocConstants.DASHBOARD_CHAT_UPLOADS_PATH;
            case "DASHBOARD_CHAT_VOICES":
            case "CHAT_VOICE":
            case "CHAT_VOICES":
                return BosDocConstants.DASHBOARD_CHAT_VOICES_PATH;

            // --- SUPPORT Module ---
            case "SUPPORT_TICKET_ATTACHMENTS":
            case "SUPPORT":
            case "SUPPORT_TEMP_ATTACHMENT":
            case "SUPPORT_TEMP_ATTACHMENTS":
                return BosDocConstants.SUPPORT_TICKET_ATTACHMENTS_PATH;
            case "SUPPORT_MY_REQUESTS":
                return BosDocConstants.SUPPORT_MY_REQUESTS_PATH;
            case "SUPPORT_REQUESTS_FOR_ME":
                return BosDocConstants.SUPPORT_REQUESTS_FOR_ME_PATH;

            // --- Generic Fallbacks ---
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

            default:
                return BosDocConstants.DEFAULT_DOC_PATH;
        }
    }
}
