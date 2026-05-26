package com.autonoma.erp.controller.admin;

import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.service.JwtService;
import com.autonoma.erp.service.FileService;
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

    @GetMapping("/fix-users")
    public String fixUsers() {
        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
        java.util.List<UserCredential> users = userRepository.findAll();
        java.util.List<com.autonoma.erp.model.admin.CompanyCredential> comps = companyCredentialRepository.findAll();
        if (comps.isEmpty()) return "No companies found";
        
        for (UserCredential u : users) {
            for (com.autonoma.erp.model.admin.CompanyCredential c : comps) {
                if (userCompanyMappingRepository.findByUserId(u.getUserId()).stream().noneMatch(m -> m.getCompanyId().equals(c.getId()))) {
                    com.autonoma.erp.model.admin.UserCompanyMapping m = new com.autonoma.erp.model.admin.UserCompanyMapping();
                    m.setUserId(u.getUserId());
                    m.setCompanyId(c.getId());
                    userCompanyMappingRepository.save(m);
                }
                
                java.util.List<com.autonoma.erp.model.Division> divs = divisionService.getActiveDivisionsByCompany(c.getId());
                for (com.autonoma.erp.model.Division d : divs) {
                    if (userDivisionMappingRepository.findByUserId(u.getUserId()).stream().noneMatch(m -> m.getDivisionId().equals(d.getId()))) {
                        com.autonoma.erp.model.admin.UserDivisionMapping m = new com.autonoma.erp.model.admin.UserDivisionMapping();
                        m.setUserId(u.getUserId());
                        m.setDivisionId(d.getId());
                        userDivisionMappingRepository.save(m);
                    }
                }
            }
        }
        return "Done mapping all users to all companies and divisions";
    }

    @GetMapping("/check-credentials")
    public ResponseEntity<?> checkCredentialsGet() {
        return ResponseEntity.status(org.springframework.http.HttpStatus.METHOD_NOT_ALLOWED)
                .body(Map.of("message", "Request method 'GET' is not supported for check-credentials. Use 'POST' with a JSON request body containing 'username' and 'password' instead."));
    }

    @PostMapping("/check-credentials")
    public ResponseEntity<?> checkCredentials(@RequestBody LoginRequest loginRequest) {
        // Step 1: Validate credentials from master database
        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
        String usernameInput = loginRequest.getUsername();
        Optional<UserCredential> userOpt = userRepository.findByUserId(usernameInput);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findAll().stream()
                    .filter(u -> u.getUserId().equalsIgnoreCase(usernameInput))
                    .findFirst();
        }

        if (userOpt.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            UserCredential user = userOpt.get();
            if (user.getStatus() != null && user.getStatus() != 1) {
                return ResponseEntity.status(403).body(Map.of("message", "Account is inactive"));
            }

            // Validate Preferred Auth Method
            if (user.getAuthMethod() != null && "FACE".equalsIgnoreCase(user.getAuthMethod())) {
                return ResponseEntity.status(403).body(Map.of("message", "Password login is disabled for this account. Please use Face ID."));
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
                // Self-healing fallback: If no mappings exist, auto-map to the default company and its active divisions
                java.util.List<com.autonoma.erp.model.admin.CompanyCredential> allCompanies = companyCredentialRepository.findAll();
                if (!allCompanies.isEmpty()) {
                    com.autonoma.erp.model.admin.CompanyCredential defaultComp = allCompanies.get(0);
                    java.util.List<com.autonoma.erp.model.Division> divisions = divisionService.getActiveDivisionsByCompany(defaultComp.getId());
                    
                    try {
                        com.autonoma.erp.model.admin.UserCompanyMapping compMapping = new com.autonoma.erp.model.admin.UserCompanyMapping();
                        compMapping.setUserId(user.getUserId());
                        compMapping.setCompanyId(defaultComp.getId());
                        compMapping.setCreatedBy("SYSTEM");
                        compMapping.setCreatedAt(new java.util.Date());
                        userCompanyMappingRepository.save(compMapping);

                        for (com.autonoma.erp.model.Division div : divisions) {
                            com.autonoma.erp.model.admin.UserDivisionMapping divMapping = new com.autonoma.erp.model.admin.UserDivisionMapping();
                            divMapping.setUserId(user.getUserId());
                            divMapping.setDivisionId(div.getId());
                            divMapping.setCreatedBy("SYSTEM");
                            divMapping.setCreatedAt(new java.util.Date());
                            userDivisionMappingRepository.save(divMapping);
                        }
                    } catch (Exception ex) {
                        // ignore constraint violations
                    }

                    Map<String, Object> match = new HashMap<>();
                    match.put("company", defaultComp);
                    match.put("divisions", divisions);
                    matches.add(match);
                } else {
                    return ResponseEntity.status(403)
                            .body(Map.of("message", "No companies or divisions assigned to this user."));
                }
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
        String usernameInput = loginRequest.getUsername();
        Optional<UserCredential> userOpt = userRepository.findByUserId(usernameInput);
        if (!userOpt.isPresent()) {
            // Case-insensitive fallback
            userOpt = userRepository.findAll().stream()
                    .filter(u -> u.getUserId().equalsIgnoreCase(usernameInput))
                    .findFirst();
        }

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

                // Validate Preferred Auth Method
                if (user.getAuthMethod() != null && "FACE".equalsIgnoreCase(user.getAuthMethod())) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Password login is disabled for this account. Please use Face ID.");
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
                userMap.put("autoLogoutOnFaceAbsence", user.getAutoLogoutOnFaceAbsence());
                userMap.put("faceDescriptor", user.getFaceDescriptor());

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
                        userMap.put("autoLogoutOnFaceAbsence", user.getAutoLogoutOnFaceAbsence());
                        userMap.put("faceDescriptor", user.getFaceDescriptor());

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

    @Autowired
    private FileService fileService;

    private byte[] getFaceImageBytes(String faceImage) {
        if (faceImage == null || faceImage.isEmpty()) {
            return null;
        }
        try {
            if (faceImage.startsWith("data:image") || faceImage.length() > 500) {
                String base64 = faceImage;
                if (base64.contains(",")) {
                    base64 = base64.split(",")[1];
                }
                return java.util.Base64.getDecoder().decode(base64.trim());
            } else {
                org.springframework.core.io.Resource resource = fileService.loadFile(faceImage);
                try (java.io.InputStream is = resource.getInputStream()) {
                    return is.readAllBytes();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to load/decode face image: " + e.getMessage());
            return null;
        }
    }

    @PostMapping("/check-face")
    public ResponseEntity<?> checkFace(@RequestBody FaceLoginRequest loginRequest) {
        String usernameInput   = loginRequest.getUsername();
        String incomingDescriptor = loginRequest.getFaceDescriptor();
        String faceImageBase64 = loginRequest.getFaceImage();

        boolean hasDescriptor = incomingDescriptor != null && !incomingDescriptor.isBlank();
        boolean hasImage      = faceImageBase64 != null && !faceImageBase64.isBlank();

        if (!hasDescriptor && !hasImage) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Face data (descriptor or image) is missing.");
            return ResponseEntity.status(400).body(error);
        }

        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");

        // Decode legacy image bytes only if no descriptor present
        byte[] webcamImageBytes = null;
        if (!hasDescriptor && hasImage) {
            try {
                String clean = faceImageBase64.contains(",") ? faceImageBase64.split(",")[1] : faceImageBase64;
                webcamImageBytes = java.util.Base64.getDecoder().decode(clean.trim());
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid image format.");
                return ResponseEntity.status(400).body(error);
            }
        }

        final byte[] finalWebcamBytes = webcamImageBytes;
        UserCredential matchedUser = null;

        if (usernameInput != null && !usernameInput.trim().isEmpty()) {
            Optional<UserCredential> userOpt = userRepository.findByUserId(usernameInput);
            if (!userOpt.isPresent()) {
                userOpt = userRepository.findAll().stream()
                        .filter(u -> u.getUserId().equalsIgnoreCase(usernameInput))
                        .findFirst();
            }
            if (userOpt.isPresent()) {
                UserCredential user = userOpt.get();
                if (user.getStatus() != null && user.getStatus() != 1) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Account is inactive");
                    return ResponseEntity.status(403).body(error);
                }
                boolean matched = false;
                // 1. Try descriptor comparison (new)
                if (hasDescriptor && user.getFaceDescriptor() != null && !user.getFaceDescriptor().isBlank()) {
                    matched = compareDescriptors(incomingDescriptor, user.getFaceDescriptor());
                }
                // 2. Fallback: legacy image comparison
                if (!matched && finalWebcamBytes != null) {
                    String storedFace = user.getFaceImage();
                    if (storedFace == null || storedFace.isEmpty()) storedFace = user.getImgName();
                    if (storedFace != null && !storedFace.isEmpty()) {
                        byte[] stored = getFaceImageBytes(storedFace);
                        if (stored != null) matched = compareFaces(finalWebcamBytes, stored);
                    }
                }
                if (matched) matchedUser = user;
            }
        } else {
            // No username — scan all active users
            java.util.List<UserCredential> allUsers = userRepository.findAll();
            for (UserCredential user : allUsers) {
                if (user.getStatus() == null || user.getStatus() != 1) continue;
                boolean matched = false;
                if (hasDescriptor && user.getFaceDescriptor() != null && !user.getFaceDescriptor().isBlank()) {
                    matched = compareDescriptors(incomingDescriptor, user.getFaceDescriptor());
                }
                if (!matched && finalWebcamBytes != null) {
                    String storedFace = user.getFaceImage();
                    if (storedFace == null || storedFace.isEmpty()) storedFace = user.getImgName();
                    if (storedFace != null && !storedFace.isEmpty()) {
                        byte[] stored = getFaceImageBytes(storedFace);
                        if (stored != null) matched = compareFaces(finalWebcamBytes, stored);
                    }
                }
                if (matched) { matchedUser = user; break; }
            }
        }

        if (matchedUser != null) {
            // Validate Preferred Auth Method
            if (matchedUser.getAuthMethod() != null && "PASSWORD".equalsIgnoreCase(matchedUser.getAuthMethod())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Face ID login is disabled for this account. Please use Password login.");
                return ResponseEntity.status(403).body(error);
            }

            java.util.List<Map<String, Object>> matches = new java.util.ArrayList<>();

            java.util.List<com.autonoma.erp.model.admin.UserCompanyMapping> compMappings = userCompanyMappingRepository
                    .findByUserId(matchedUser.getUserId());

            java.util.List<com.autonoma.erp.model.admin.UserDivisionMapping> divMappings = userDivisionMappingRepository
                    .findByUserId(matchedUser.getUserId());

            boolean isSuperUser = (matchedUser.getIsBosAdmin() != null && matchedUser.getIsBosAdmin() == 1);

            if (isSuperUser) {
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
                // Self-healing fallback: If no mappings exist, auto-map to the default company and its active divisions
                java.util.List<com.autonoma.erp.model.admin.CompanyCredential> allCompanies = companyCredentialRepository.findAll();
                if (!allCompanies.isEmpty()) {
                    com.autonoma.erp.model.admin.CompanyCredential defaultComp = allCompanies.get(0);
                    java.util.List<com.autonoma.erp.model.Division> divisions = divisionService.getActiveDivisionsByCompany(defaultComp.getId());
                    
                    try {
                        com.autonoma.erp.model.admin.UserCompanyMapping compMapping = new com.autonoma.erp.model.admin.UserCompanyMapping();
                        compMapping.setUserId(matchedUser.getUserId());
                        compMapping.setCompanyId(defaultComp.getId());
                        compMapping.setCreatedBy("SYSTEM");
                        compMapping.setCreatedAt(new java.util.Date());
                        userCompanyMappingRepository.save(compMapping);

                        for (com.autonoma.erp.model.Division div : divisions) {
                            com.autonoma.erp.model.admin.UserDivisionMapping divMapping = new com.autonoma.erp.model.admin.UserDivisionMapping();
                            divMapping.setUserId(matchedUser.getUserId());
                            divMapping.setDivisionId(div.getId());
                            divMapping.setCreatedBy("SYSTEM");
                            divMapping.setCreatedAt(new java.util.Date());
                            userDivisionMappingRepository.save(divMapping);
                        }
                    } catch (Exception ex) {
                        // ignore constraint violations
                    }

                    Map<String, Object> match = new HashMap<>();
                    match.put("company", defaultComp);
                    match.put("divisions", divisions);
                    matches.add(match);
                }
            }

            Map<String, Object> bodyResult = new HashMap<>();
            bodyResult.put("matches", matches);
            bodyResult.put("userId", matchedUser.getUserId());

            return ResponseEntity.ok()
                    .header("x-is-bos-admin", isSuperUser ? "1" : "0")
                    .body(bodyResult);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "Facial recognition verification failed. Face does not match any registered user.");
        return ResponseEntity.status(401).body(error);
    }

    @PostMapping("/face-login")
    public ResponseEntity<?> faceLogin(@RequestBody FaceLoginRequest loginRequest, HttpServletRequest request) {
        String usernameInput = loginRequest.getUsername();
        String incomingDescriptor = loginRequest.getFaceDescriptor();
        String faceImageBase64 = loginRequest.getFaceImage();

        boolean hasDescriptor = incomingDescriptor != null && !incomingDescriptor.isBlank();
        boolean hasImage      = faceImageBase64 != null && !faceImageBase64.isBlank();

        if (!hasDescriptor && !hasImage) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Face data (descriptor or image) is missing.");
            return ResponseEntity.status(400).body(error);
        }

        com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");

        byte[] webcamImageBytes = null;
        if (!hasDescriptor && hasImage) {
            try {
                String clean = faceImageBase64.contains(",") ? faceImageBase64.split(",")[1] : faceImageBase64;
                webcamImageBytes = java.util.Base64.getDecoder().decode(clean.trim());
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid image format.");
                return ResponseEntity.status(400).body(error);
            }
        }

        final byte[] finalWebcamBytes = webcamImageBytes;
        UserCredential matchedUser = null;

        if (usernameInput != null && !usernameInput.trim().isEmpty()) {
            Optional<UserCredential> userOpt = userRepository.findByUserId(usernameInput);
            if (!userOpt.isPresent()) {
                userOpt = userRepository.findAll().stream()
                        .filter(u -> u.getUserId().equalsIgnoreCase(usernameInput))
                        .findFirst();
            }
            if (userOpt.isPresent()) {
                UserCredential user = userOpt.get();
                boolean matched = false;
                if (hasDescriptor && user.getFaceDescriptor() != null && !user.getFaceDescriptor().isBlank()) {
                    matched = compareDescriptors(incomingDescriptor, user.getFaceDescriptor());
                }
                if (!matched && finalWebcamBytes != null) {
                    String storedFace = user.getFaceImage();
                    if (storedFace == null || storedFace.isEmpty()) storedFace = user.getImgName();
                    if (storedFace != null && !storedFace.isEmpty()) {
                        byte[] stored = getFaceImageBytes(storedFace);
                        if (stored != null) matched = compareFaces(finalWebcamBytes, stored);
                    }
                }
                if (matched) matchedUser = user;
            }
        } else {
            java.util.List<UserCredential> allUsers = userRepository.findAll();
            for (UserCredential user : allUsers) {
                if (user.getStatus() == null || user.getStatus() != 1) continue;
                boolean matched = false;
                if (hasDescriptor && user.getFaceDescriptor() != null && !user.getFaceDescriptor().isBlank()) {
                    matched = compareDescriptors(incomingDescriptor, user.getFaceDescriptor());
                }
                if (!matched && finalWebcamBytes != null) {
                    String storedFace = user.getFaceImage();
                    if (storedFace == null || storedFace.isEmpty()) storedFace = user.getImgName();
                    if (storedFace != null && !storedFace.isEmpty()) {
                        byte[] stored = getFaceImageBytes(storedFace);
                        if (stored != null) matched = compareFaces(finalWebcamBytes, stored);
                    }
                }
                if (matched) { matchedUser = user; break; }
            }
        }

        if (matchedUser != null) {
            UserCredential user = matchedUser;
            // Validate Preferred Auth Method
            if (user.getAuthMethod() != null && "PASSWORD".equalsIgnoreCase(user.getAuthMethod())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Face ID login is disabled for this account. Please use Password login.");
                return ResponseEntity.status(403).body(error);
            }

            if (user.getStatus() != null && user.getStatus() != 1) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Account is inactive");
                return ResponseEntity.status(403).body(error);
            }

            java.util.List<com.autonoma.erp.model.admin.CompanyCredential> configs = companyCredentialRepository.findAll();
            if (!configs.isEmpty()) {
                com.autonoma.erp.model.admin.CompanyCredential config = configs.get(0);
                if (config.getLicExpiryDate() != null) {
                    java.util.Date now = new java.util.Date();
                    if (now.after(config.getLicExpiryDate())) {
                        if (user.getIsBosAdmin() == null || user.getIsBosAdmin() != 1) {
                            Map<String, String> error = new HashMap<>();
                            error.put("message", "System License Expired. Please contact support.");
                            return ResponseEntity.status(403).body(error);
                        }
                    }
                }
            }

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
            userSessionService.recordLogin(user.getUserId(), request, request.getHeader("User-Agent"));

            Map<String, Object> response = new HashMap<>();
            response.put("serviceToken", token);

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
            userMap.put("autoLogoutOnFaceAbsence", user.getAutoLogoutOnFaceAbsence());
            userMap.put("faceDescriptor", user.getFaceDescriptor());

            enrichUserMapWithTenantInfo(userMap);
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        }

        Map<String, String> error = new HashMap<>();
        error.put("message", "User not found");
        return ResponseEntity.status(401).body(error);
    }

    // ─── Face Descriptor (Embedding) Comparison ───────────────────────────────

    /**
     * Parse a JSON descriptor string "[0.1, 0.2, ...]" into a double array.
     */
    private double[] parseDescriptor(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            String trimmed = json.trim();
            if (!trimmed.startsWith("[")) return null;
            trimmed = trimmed.substring(1, trimmed.length() - 1);
            String[] parts = trimmed.split(",");
            double[] result = new double[parts.length];
            for (int i = 0; i < parts.length; i++) {
                result[i] = Double.parseDouble(parts[i].trim());
            }
            return result;
        } catch (Exception e) {
            System.err.println("[FaceAuth] Failed to parse descriptor: " + e.getMessage());
            return null;
        }
    }

    /**
     * Euclidean distance between two 128-D face descriptors.
     * Distance ≤ 0.6 → same person (face-api.js industry standard).
     */
    private double euclideanDistance(double[] d1, double[] d2) {
        if (d1 == null || d2 == null || d1.length != d2.length) return Double.MAX_VALUE;
        double sum = 0;
        for (int i = 0; i < d1.length; i++) {
            double diff = d1[i] - d2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    private static final double FACE_MATCH_THRESHOLD = 0.6;

    /**
     * Compare an incoming descriptor against a user's stored descriptor.
     * Returns true if distance is within threshold.
     */
    private boolean compareDescriptors(String incomingJson, String storedJson) {
        double[] incoming = parseDescriptor(incomingJson);
        double[] stored   = parseDescriptor(storedJson);
        if (incoming == null || stored == null) return false;
        double dist = euclideanDistance(incoming, stored);
        System.out.println("[FaceAuth] Descriptor distance: " + dist + " (threshold: " + FACE_MATCH_THRESHOLD + ")");
        return dist <= FACE_MATCH_THRESHOLD;
    }

    /**
     * Legacy pixel-level comparison — kept as fallback for users who enrolled
     * before the descriptor upgrade. Less accurate but still functional.
     */
    private boolean compareFaces(byte[] webcamImageBytes, byte[] storedImageBytes) {
        try {
            java.awt.image.BufferedImage webcamImg = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(webcamImageBytes));
            java.awt.image.BufferedImage storedImg = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(storedImageBytes));
            if (webcamImg == null || storedImg == null) return false;
            java.awt.image.BufferedImage webcamResized = resizeImage(webcamImg, 64, 64);
            java.awt.image.BufferedImage storedResized = resizeImage(storedImg, 64, 64);
            long diffSum = 0;
            for (int y = 0; y < 64; y++) {
                for (int x = 0; x < 64; x++) {
                    int rw = webcamResized.getRGB(x, y), rs = storedResized.getRGB(x, y);
                    int gw = (int)(0.299*((rw>>16)&0xff) + 0.587*((rw>>8)&0xff) + 0.114*(rw&0xff));
                    int gs = (int)(0.299*((rs>>16)&0xff) + 0.587*((rs>>8)&0xff) + 0.114*(rs&0xff));
                    diffSum += Math.abs(gw - gs);
                }
            }
            double avgDiff = (double) diffSum / (64 * 64);
            System.out.println("[FaceAuth][Legacy] Pixel diff: " + avgDiff);
            return avgDiff <= 70.0;
        } catch (Exception e) { e.printStackTrace(); return false; }
    }

    private java.awt.image.BufferedImage resizeImage(java.awt.image.BufferedImage src, int w, int h) {
        java.awt.image.BufferedImage dst = new java.awt.image.BufferedImage(w, h, java.awt.image.BufferedImage.TYPE_BYTE_GRAY);
        java.awt.Graphics2D g = dst.createGraphics();
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return dst;
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

class FaceLoginRequest {
    private String username;
    private String faceImage;
    private String tenantId;
    private Long divisionId;
    /** 128-D descriptor array serialized as JSON string from face-api.js */
    private String faceDescriptor;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFaceImage() { return faceImage; }
    public void setFaceImage(String faceImage) { this.faceImage = faceImage; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public Long getDivisionId() { return divisionId; }
    public void setDivisionId(Long divisionId) { this.divisionId = divisionId; }

    public String getFaceDescriptor() { return faceDescriptor; }
    public void setFaceDescriptor(String faceDescriptor) { this.faceDescriptor = faceDescriptor; }

    public void setEmail(String email) { this.username = email; }
}
