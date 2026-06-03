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

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    @PostMapping("/update-database-case-style")
    @RequirePagePermission(pageCode = "AD1110", action = "write")
    public ResponseEntity<Map<String, String>> updateDatabaseCaseStyle(@RequestParam("style") String style) {
        Map<String, String> response = new HashMap<>();
        try {
            java.sql.Connection conn = java.util.Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection();
            java.sql.DatabaseMetaData metaData = conn.getMetaData();
            String catalog = conn.getCatalog();
            
            if ("CUSTOM".equals(style)) {
                response.put("message", "No database update required for CUSTOM style.");
                return ResponseEntity.ok(response);
            }
            
            // List of tables to skip (sensitive or system tables)
            List<String> skipTables = java.util.Arrays.asList(
                "ad_user_credential", "ad_user_credentials", "ad_company_credential",
                "ad_backend_error_log", "flyway_schema_history"
            );

            if ("PROPER_CASE".equals(style)) {
                try {
                    jdbcTemplate.execute("IF OBJECT_ID('dbo.InitCap', 'FN') IS NOT NULL DROP FUNCTION dbo.InitCap");
                    jdbcTemplate.execute("CREATE FUNCTION dbo.InitCap(@String VARCHAR(MAX)) RETURNS VARCHAR(MAX) AS BEGIN DECLARE @Index INT, @Char CHAR(1), @PrevChar CHAR(1), @Output VARCHAR(MAX); SET @Output = LOWER(@String); SET @Index = 1; SET @PrevChar = ' '; WHILE @Index <= LEN(@String) BEGIN SET @Char = SUBSTRING(@String, @Index, 1); IF @PrevChar IN (' ', ';', ':', '!', '?', ',', '.', '_', '-', '/', '&', '''', '(') BEGIN IF @Char != ' ' SET @Output = STUFF(@Output, @Index, 1, UPPER(@Char)); END SET @PrevChar = @Char; SET @Index = @Index + 1; END RETURN @Output; END");
                } catch (Exception ex) {
                    System.err.println("Failed to create InitCap function: " + ex.getMessage());
                }
            }

            java.sql.ResultSet tables = metaData.getTables(catalog, null, "%", new String[]{"TABLE"});
            int updatedTables = 0;
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                String lowerTable = tableName.toLowerCase();
                if (skipTables.contains(lowerTable)) continue;
                if (lowerTable.startsWith("ad_") || lowerTable.startsWith("bos_") || lowerTable.startsWith("ch_")) {
                    continue;
                }

                java.sql.ResultSet columns = metaData.getColumns(catalog, null, tableName, "%");
                List<String> stringColumns = new java.util.ArrayList<>();
                while (columns.next()) {
                    String colName = columns.getString("COLUMN_NAME");
                    int dataType = columns.getInt("DATA_TYPE");
                    // Types: VARCHAR, NVARCHAR, LONGVARCHAR, CHAR
                    if (dataType == java.sql.Types.VARCHAR || dataType == java.sql.Types.NVARCHAR || 
                        dataType == java.sql.Types.LONGVARCHAR || dataType == java.sql.Types.CHAR ||
                        dataType == java.sql.Types.LONGNVARCHAR) {
                        
                        // Exclude obvious non-text fields or passwords
                        String lowerCol = colName.toLowerCase();
                        if (!lowerCol.contains("password") && !lowerCol.contains("email") && 
                            !lowerCol.contains("hash") && !lowerCol.contains("token") && 
                            !lowerCol.contains("id") && !lowerCol.contains("path") && !lowerCol.contains("url") &&
                            !lowerCol.contains("created_by") && !lowerCol.contains("updated_by") && 
                            !lowerCol.contains("user_name") && !lowerCol.contains("username")) {
                            stringColumns.add(colName);
                        }
                    }
                }
                
                if (!stringColumns.isEmpty()) {
                    StringBuilder sql = new StringBuilder("UPDATE " + tableName + " SET ");
                    for (int i = 0; i < stringColumns.size(); i++) {
                        String col = stringColumns.get(i);
                        if ("UPPER_CASE".equals(style)) {
                            sql.append(col).append(" = UPPER(").append(col).append(")");
                        } else if ("LOWER_CASE".equals(style)) {
                            sql.append(col).append(" = LOWER(").append(col).append(")");
                        } else if ("PROPER_CASE".equals(style)) {
                            sql.append(col).append(" = dbo.InitCap(").append(col).append(")");
                        }
                        if (i < stringColumns.size() - 1) sql.append(", ");
                    }
                    
                    if (("UPPER_CASE".equals(style) || "LOWER_CASE".equals(style) || "PROPER_CASE".equals(style)) && !sql.toString().endsWith("SET ")) {
                        try {
                            jdbcTemplate.update(sql.toString());
                            updatedTables++;
                        } catch (Exception ex) {
                            System.err.println("Skipped updating table " + tableName + " due to error: " + ex.getMessage());
                        }
                    }
                }
            }
            conn.close();
            response.put("message", "Database successfully updated to " + style + ". Tables affected: " + updatedTables);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Database update failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
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
            existing.setRestoreEnableDays(details.getRestoreEnableDays());
            existing.setInputCaseStyle(details.getInputCaseStyle());

            existing.setRegistrationNo(details.getRegistrationNo());
            existing.setPanNo(details.getPanNo());
            existing.setMobileNo(details.getMobileNo());
            existing.setPhoneNo(details.getPhoneNo());
            existing.setEmailId(details.getEmailId());
            existing.setWebsite(details.getWebsite());
            existing.setSupportEmail(details.getSupportEmail());
            existing.setSupportPhone(details.getSupportPhone());
            existing.setGmaplink(details.getGmaplink());
            existing.setDecimalPlaces(details.getDecimalPlaces());
            existing.setCurrencyCode(details.getCurrencyCode());
            existing.setSmtpHost(details.getSmtpHost());
            existing.setSmtpPort(details.getSmtpPort());
            existing.setSmtpUsername(details.getSmtpUsername());
            existing.setSmtpPassword(details.getSmtpPassword());
            existing.setSmtpSslEnabled(details.getSmtpSslEnabled());
            existing.setAuditLogEnabled(details.getAuditLogEnabled());

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
