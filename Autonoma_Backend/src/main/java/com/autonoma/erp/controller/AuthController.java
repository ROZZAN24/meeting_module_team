package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import com.autonoma.erp.service.JwtService;
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

                String token = jwtService.generateToken(user.getUserId());

                Map<String, Object> response = new HashMap<>();
                response.put("serviceToken", token);

                // Map to the format the frontend expects
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getUserId());
                userMap.put("email", user.getUserId());
                userMap.put("name", "Employee " + user.getEmpId());
                userMap.put("role", "ADMIN");

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
    public ResponseEntity<?> me(@RequestHeader("Authorization") String token) {
        // Return first user or mock for now to satisfy session check
        // In production, this would use token validation
        return userRepository.findAll().stream().findFirst()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getUserId());
                    userMap.put("email", user.getUserId());
                    userMap.put("name", user.getEmpId());
                    userMap.put("role", "ADMIN");

                    Map<String, Object> resp = new HashMap<>();
                    resp.put("user", userMap);
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.status(401).build());
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

@Data
class LoginRequest {
    private String username;
    private String password;

    // Getter/Setter for 'email' to handle frontend's payload
    public void setEmail(String email) {
        this.username = email;
    }
}
