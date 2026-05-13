package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import com.autonoma.erp.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
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
    private FileService fileService;

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
        // Password decryption logic omitted for security/simplicity as per existing code but note it should handle properly
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCredential user) {
        if (userRepository.existsById(user.getUserId())) {
            return ResponseEntity.badRequest().body("User ID already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedDate(new Date());
        user.setCreatedBy(getCurrentUserId());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserCredential userDetails) {
        return userRepository.findById(id).map(user -> {
            // Delete old image if it's being replaced
            if (userDetails.getImgName() != null && !userDetails.getImgName().equals(user.getImgName())) {
                fileService.deleteFile(user.getImgName());
            }

            user.setEmpId(userDetails.getEmpId());
            user.setStatus(userDetails.getStatus());
            user.setImgName(userDetails.getImgName());
            
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            
            user.setUpdatedBy(getCurrentUserId());
            user.setUpdatedDate(new Date());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/upload-profile-pic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePic(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "previousFile", required = false) String previousFile) {
        try {
            if (previousFile != null && !previousFile.isEmpty()) {
                fileService.deleteFile(previousFile);
            }

            String relativePath = fileService.saveFile(file, "USER_PROFILE");
            Map<String, String> response = new HashMap<>();
            response.put("fileName", relativePath);
            response.put("message", "Profile picture uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping({"/image/{*filename}", "/image"})
    public ResponseEntity<Resource> getImage(
            @PathVariable(required = false) String filename,
            @RequestParam(required = false) String fileNameParam) {
        try {
            String targetFile = filename != null ? filename : fileNameParam;
            if (targetFile == null || targetFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (targetFile.startsWith("/")) targetFile = targetFile.substring(1);
            
            Resource resource = fileService.loadFile(targetFile);
            String contentType = Files.probeContentType(resource.getFile().toPath());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
