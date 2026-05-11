package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import com.autonoma.erp.service.JwtService;
import com.autonoma.erp.service.CompanyCredentialService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Find user by userId
        Optional<UserCredential> userOpt = userRepository.findByUserId(request.getUsername());

        if (userOpt.isPresent()) {
            UserCredential user = userOpt.get();

            // Validate Password
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {

                // Validate Status (assuming 1 is Active)
                if (user.getStatus() != null && user.getStatus() != 1) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Account is inactive");
                    return ResponseEntity.status(403).body(error);
                }

                // License Check
                java.util.List<com.autonoma.erp.model.CompanyCredential> configs = companyService.findAll();
                if (!configs.isEmpty()) {
                    com.autonoma.erp.model.CompanyCredential config = configs.get(0);
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

                String token = jwtService.generateToken(user.getUserId());

                Map<String, Object> response = new HashMap<>();
                response.put("serviceToken", token);

                // Map to the format the frontend expects
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getUserId());
                userMap.put("email", user.getUserId());
                userMap.put("name", "Employee " + user.getEmpId());
                userMap.put("role", "ADMIN");
                userMap.put("imgName", user.getImgName());
                userMap.put("isBosAdmin", user.getIsBosAdmin());

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
                        userMap.put("name", user.getEmpId());
                        userMap.put("role", "ADMIN");
                        userMap.put("imgName", user.getImgName());
                        userMap.put("isBosAdmin", user.getIsBosAdmin());

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
        java.util.List<com.autonoma.erp.model.CompanyCredential> configs = companyService.findAll();
        Map<String, Object> status = new HashMap<>();

        if (!configs.isEmpty()) {
            com.autonoma.erp.model.CompanyCredential config = configs.get(0);
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
}

class LoginRequest {
    private String username;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Getter/Setter for 'email' to handle frontend's payload
    public void setEmail(String email) {
        this.username = email;
    }
}
