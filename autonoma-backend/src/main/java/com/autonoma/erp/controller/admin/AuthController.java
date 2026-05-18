package com.autonoma.erp.controller.admin;

import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.service.JwtService;
import com.autonoma.erp.service.admin.CompanyCredentialService;
import com.autonoma.erp.service.admin.UserSessionService;
import com.autonoma.erp.service.admin.TenantDataSourceService;
import com.autonoma.erp.repository.admin.UserCompanyMappingRepository;
import com.autonoma.erp.repository.admin.UserDivisionMappingRepository;
import com.autonoma.erp.repository.admin.CompanyCredentialRepository;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/account")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CompanyCredentialService companyService;

    @Autowired
    private UserSessionService userSessionService;

    @Autowired
    private com.autonoma.erp.service.DivisionService divisionService;

    @Autowired
    private com.autonoma.erp.repository.EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.UserCompanyMappingRepository userCompanyMappingRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.UserDivisionMappingRepository userDivisionMappingRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.CompanyCredentialRepository companyCredentialRepository;

    @PostMapping("/check-credentials")
    public ResponseEntity<?> checkCredentials(@RequestBody LoginRequest loginRequest) {
        // Step 1: Validate credentials from master database
        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
        Optional<UserCredential> userOpt = userRepository.findByUserId(loginRequest.getUsername());

        if (userOpt.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            UserCredential user = userOpt.get();
            if (user.getStatus() != null && user.getStatus() != 1) {
                return ResponseEntity.status(403).body(Map.of("message", "Account is inactive"));
            }

            // Step 2: Fetch mapped companies and divisions
            java.util.List<Map<String, Object>> matches = new java.util.ArrayList<>();

            java.util.List<com.autonoma.erp.model.admin.UserCompanyMapping> compMappings = userCompanyMappingRepository
                    .findByUserId(user.getUserId());

            java.util.List<com.autonoma.erp.model.admin.UserDivisionMapping> divMappings = userDivisionMappingRepository
                    .findByUserId(user.getUserId());

            boolean isSuperUser = (user.getIsBosAdmin() != null && user.getIsBosAdmin() == 1);

            if (isSuperUser) {
                // Super Users get everything regardless of mappings
                java.util.List<com.autonoma.erp.model.admin.CompanyCredential> allCompanies = companyCredentialRepository
                        .findAll();
                for (com.autonoma.erp.model.admin.CompanyCredential company : allCompanies) {
                    java.util.List<com.autonoma.erp.model.Division> divisions = divisionService
                            .getActiveDivisionsByCompany(company.getId());
                    Map<String, Object> match = new HashMap<>();
                    match.put("company", company);
                    match.put("divisions", divisions);
                    matches.add(match);
                }
            } else {
                java.util.Set<Long> mappedDivIds = divMappings.stream()
                        .map(com.autonoma.erp.model.admin.UserDivisionMapping::getDivisionId)
                        .collect(java.util.stream.Collectors.toSet());

                for (com.autonoma.erp.model.admin.UserCompanyMapping mapping : compMappings) {
                    companyCredentialRepository.findById(mapping.getCompanyId()).ifPresent(company -> {
                        java.util.List<com.autonoma.erp.model.Division> divisions = divisionService
                                .getActiveDivisionsByCompany(company.getId())
                                .stream()
                                .filter(d -> mappedDivIds.contains(d.getId()))
                                .collect(java.util.stream.Collectors.toList());

                        Map<String, Object> match = new HashMap<>();
                        match.put("company", company);
                        match.put("divisions", divisions);
                        matches.add(match);
                    });
                }
            }

            if (matches.isEmpty() && !isSuperUser) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "No companies or divisions assigned to this user."));
            }

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (isSuperUser) {
                headers.add("X-Is-Bos-Admin", "1");
                headers.add("Access-Control-Expose-Headers", "X-Is-Bos-Admin");
            }

            return new ResponseEntity<>(matches, headers, org.springframework.http.HttpStatus.OK);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid User ID or Password"));
    }

    @GetMapping("/switch-options")
    public ResponseEntity<?> getSwitchOptions() {
        String userId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");

        java.util.List<Map<String, Object>> matches = new java.util.ArrayList<>();

        java.util.List<com.autonoma.erp.model.admin.UserCompanyMapping> compMappings = userCompanyMappingRepository
                .findByUserId(userId);

        java.util.List<com.autonoma.erp.model.admin.UserDivisionMapping> divMappings = userDivisionMappingRepository
                .findByUserId(userId);

        com.autonoma.erp.model.admin.UserCredential user = userRepository.findByUserId(userId).orElse(null);
        boolean isSuperUser = (user != null && user.getIsBosAdmin() != null && user.getIsBosAdmin() == 1);

        if (isSuperUser) {
            // Super Users get everything regardless of mappings
            java.util.List<com.autonoma.erp.model.admin.CompanyCredential> allCompanies = companyCredentialRepository
                    .findAll();
            for (com.autonoma.erp.model.admin.CompanyCredential company : allCompanies) {
                java.util.List<com.autonoma.erp.model.Division> divisions = divisionService
                        .getActiveDivisionsByCompany(company.getId());
                Map<String, Object> match = new HashMap<>();
                match.put("company", company);
                match.put("divisions", divisions);
                matches.add(match);
            }
        } else {
            java.util.Set<Long> mappedDivIds = divMappings.stream()
                    .map(com.autonoma.erp.model.admin.UserDivisionMapping::getDivisionId)
                    .collect(java.util.stream.Collectors.toSet());

            for (com.autonoma.erp.model.admin.UserCompanyMapping mapping : compMappings) {
                companyCredentialRepository.findById(mapping.getCompanyId()).ifPresent(company -> {
                    java.util.List<com.autonoma.erp.model.Division> divisions = divisionService
                            .getActiveDivisionsByCompany(company.getId())
                            .stream()
                            .filter(d -> mappedDivIds.contains(d.getId()))
                            .collect(java.util.stream.Collectors.toList());

                    Map<String, Object> match = new HashMap<>();
                    match.put("company", company);
                    match.put("divisions", divisions);
                    matches.add(match);
                });
            }
        }

        return ResponseEntity.ok(matches);
    }

    @Autowired
    private TenantDataSourceService tenantDataSourceService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        // Find user by userId
        Optional<UserCredential> userOpt = userRepository.findByUserId(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            UserCredential user = userOpt.get();

            // Validate Password
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {

                // Validate Status (assuming 1 is Active)
                if (user.getStatus() != null && user.getStatus() != 1) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Account is inactive");
                    return ResponseEntity.status(403).body(error);
                }

                // License Check
                java.util.List<com.autonoma.erp.model.admin.CompanyCredential> configs = companyCredentialRepository
                        .findAll();
                if (!configs.isEmpty()) {
                    com.autonoma.erp.model.admin.CompanyCredential config = configs.get(0);
                    if (config.getLicExpiryDate() != null) {
                        java.util.Date now = new java.util.Date();
                        if (now.after(config.getLicExpiryDate())) {
                            // Expired - only allow IS_BOS_ADMIN=1
                            if (user.getIsBosAdmin() == null || user.getIsBosAdmin() != 1) {
                                Map<String, String> error = new HashMap<>();
                                error.put("message", "System License Expired. Please contact support.");
                                return ResponseEntity.status(403).body(error);
                            }
                        }
                    }
                }

                // Apply Tenant and Division context if provided
                if (loginRequest.getTenantId() != null && !loginRequest.getTenantId().trim().isEmpty()) {
                    try {
                        tenantDataSourceService.createTenantDataSource(loginRequest.getTenantId().trim());
                        com.autonoma.erp.config.TenantContextHolder.setTenantId(loginRequest.getTenantId().trim());
                    } catch (Exception e) {
                        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
                    }
                }
                if (loginRequest.getDivisionId() != null) {
                    com.autonoma.erp.config.DivisionContextHolder.setDivisionId(loginRequest.getDivisionId());
                }

                String token = jwtService.generateToken(user.getUserId());

                // Record Login Session
                userSessionService.recordLogin(user.getUserId(), request, request.getHeader("User-Agent"));

                Map<String, Object> response = new HashMap<>();
                response.put("serviceToken", token);

                // Map to the format the frontend expects
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getUserId());
                userMap.put("email", user.getUserId());
                userMap.put("empId", user.getEmpId());

                String empName = "Employee " + user.getEmpId();
                if (user.getEmpId() != null) {
                    empName = employeeMasterRepository.findById(user.getEmpId())
                            .map(e -> e.getEmployeeName())
                            .orElse(empName);
                }
                userMap.put("name", empName);
                userMap.put("role", "ADMIN");
                userMap.put("imgName", user.getImgName());
                userMap.put("isBosAdmin", user.getIsBosAdmin());

                enrichUserMapWithTenantInfo(userMap);

                response.put("user", userMap);

                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid password");
                return ResponseEntity.status(401).body(error);
            }
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "User not found");
        return ResponseEntity.status(401).body(error);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        try {
            String userId = jwtService.extractUsername(token);
            return userRepository.findByUserId(userId)
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getUserId());
                        userMap.put("email", user.getUserId());
                        userMap.put("empId", user.getEmpId());

                        String empName = "Employee " + user.getEmpId();
                        if (user.getEmpId() != null) {
                            empName = employeeMasterRepository.findById(user.getEmpId())
                                    .map(e -> e.getEmployeeName())
                                    .orElse(empName);
                        }
                        userMap.put("name", empName);
                        userMap.put("role", "ADMIN");
                        userMap.put("imgName", user.getImgName());
                        userMap.put("isBosAdmin", user.getIsBosAdmin());

                        enrichUserMapWithTenantInfo(userMap);

                        Map<String, Object> resp = new HashMap<>();
                        resp.put("user", userMap);
                        return ResponseEntity.ok(resp);
                    })
                    .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @GetMapping("/license-status")
    public ResponseEntity<?> getLicenseStatus() {
        java.util.List<com.autonoma.erp.model.admin.CompanyCredential> configs = companyService.findAll();
        Map<String, Object> status = new HashMap<>();

        if (!configs.isEmpty()) {
            com.autonoma.erp.model.admin.CompanyCredential config = configs.get(0);
            status.put("licExpiryDate", config.getLicExpiryDate());
            status.put("licExpRemainderDays", config.getLicExpRemainderDays());

            if (config.getLicExpiryDate() != null) {
                java.util.Date now = new java.util.Date();
                status.put("isExpired", now.after(config.getLicExpiryDate()));

                long diff = config.getLicExpiryDate().getTime() - now.getTime();
                long daysLeft = diff / (1000 * 60 * 60 * 24);
                status.put("daysLeft", daysLeft);
                status.put("isWarningPeriod", daysLeft <= config.getLicExpRemainderDays() && daysLeft >= 0);
            } else {
                status.put("isExpired", false);
                status.put("isWarningPeriod", false);
            }
        } else {
            status.put("isExpired", false);
            status.put("isWarningPeriod", false);
        }

        return ResponseEntity.ok(status);
    }

    @GetMapping("/bootstrap")
    public ResponseEntity<String> bootstrap() {
        Optional<UserCredential> userOpt = userRepository.findByUserId("admin");
        if (userOpt.isPresent()) {
            UserCredential user = userOpt.get();
            user.setPassword(passwordEncoder.encode("admin"));
            userRepository.save(user);
            return ResponseEntity.ok("Admin password updated to encrypted 'admin'");
        }
        return ResponseEntity.notFound().build();
    }

    private void enrichUserMapWithTenantInfo(Map<String, Object> userMap) {
        String tenantId = com.autonoma.erp.config.TenantContextHolder.getTenantId();
        Long divisionId = com.autonoma.erp.config.DivisionContextHolder.getDivisionId();

        if (tenantId != null) {
            userMap.put("tenantId", tenantId);
            // Switch to Master context to fetch company list safely
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            companyService.findAll().stream()
                    .filter(c -> tenantId.equals(c.getDbSourceName()))
                    .findFirst()
                    .ifPresent(c -> userMap.put("companyName", c.getCompanyName()));
            // Restore current tenant
            com.autonoma.erp.config.TenantContextHolder.setTenantId(tenantId);
        }

        if (divisionId != null) {
            userMap.put("divisionId", divisionId);
            String currentTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
            com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
            divisionService.findById(divisionId)
                    .ifPresent(d -> userMap.put("divisionName", d.getDivisionName()));
            com.autonoma.erp.config.TenantContextHolder.setTenantId(currentTenant);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        if (userId != null) {
            userSessionService.recordLogout(userId);
        }
        return ResponseEntity.ok().build();
    }
}

class LoginRequest {
    private String username;
    private String password;
    private String tenantId;
    private Long divisionId;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Long getDivisionId() {
        return divisionId;
    }

    public void setDivisionId(Long divisionId) {
        this.divisionId = divisionId;
    }

    // Getter/Setter for 'email' to handle frontend's payload
    public void setEmail(String email) {
        this.username = email;
    }
}
