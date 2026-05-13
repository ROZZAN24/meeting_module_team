package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import com.autonoma.erp.service.UserService;
import AppUtil.BosDocConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserCredential>> getAllUsers() {
        List<UserCredential> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(com.autonoma.erp.util.AESUtil.decrypt(u.getPassword())));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCredential user) {
        if (userRepository.existsById(user.getUserId())) {
            return ResponseEntity.badRequest().body("User ID already exists");
        }

        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setCreatedDate(new Date());
        user.setCreatedBy(getCurrentUserId());

        UserCredential savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserCredential userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setEmpId(userDetails.getEmpId());
            user.setStatus(userDetails.getStatus());
            user.setImgName(userDetails.getImgName());
            
            // In this reversible setup, the UI sends plain text
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            
            user.setUpdatedBy(getCurrentUserId());
            user.setUpdatedDate(new Date());
            
            UserCredential updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/upload-profile-pic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePic(@RequestParam("file") MultipartFile file) {
        try {
            String filename = userService.saveUploadedFile(file, BosDocConstants.USER_PROFILE_DOC_PATH);
            Map<String, String> response = new HashMap<>();
            response.put("fileName", filename);
            response.put("message", "Profile picture uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Resource resource = userService.loadFileAsResource(filename, BosDocConstants.USER_PROFILE_DOC_PATH);
            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(Paths.get(resource.getURI()));
            } catch (Exception ex) {
                // Ignore fallback
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
