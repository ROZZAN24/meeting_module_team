package com.autonoma.erp.controller.admin;


import com.autonoma.erp.security.RequirePagePermission;
import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.admin.UserRepository;
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
        // Password decryption logic omitted for security/simplicity as per existing
        // code but note it should handle properly
        return ResponseEntity.ok(users);
    }

    @PostMapping("/create")


    @RequirePagePermission(pageCode = "AD1130", action = "write")
    public ResponseEntity<?> createUser(@RequestBody UserCredential user) {
        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID cannot be empty");
        }
        if (userRepository.existsById(user.getUserId())) {
            return ResponseEntity.badRequest().body("User ID already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedDate(new Date());
        user.setCreatedBy(getCurrentUserId());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/update/{id}")


    @RequirePagePermission(pageCode = "AD1130", action = "write")
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
                // Prevent double-encoding if the frontend sends back the existing encrypted hash
                if (!userDetails.getPassword().equals(user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                }
            }

            user.setUpdatedBy(getCurrentUserId());
            user.setUpdatedDate(new Date());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/upload-profile-pic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)


    @RequirePagePermission(pageCode = "AD1130", action = "write")
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

    @GetMapping({ "/image/{*filename}", "/image" })
    public ResponseEntity<Resource> getImage(
            @PathVariable(required = false) String filename,
            @RequestParam(required = false) String fileNameParam) {
        try {
            String targetFile = filename != null ? filename : fileNameParam;
            if (targetFile == null || targetFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (targetFile.startsWith("/"))
                targetFile = targetFile.substring(1);

            Resource resource = fileService.loadFile(targetFile);
            String contentType = Files.probeContentType(resource.getFile().toPath());
            return ResponseEntity.ok()
                    .contentType(
                            MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")


    @RequirePagePermission(pageCode = "AD1130", action = "delete")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private com.autonoma.erp.repository.admin.UserDivisionMappingRepository userDivisionMappingRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.UserCompanyMappingRepository userCompanyMappingRepository;

    @Autowired
    private com.autonoma.erp.service.DivisionService divisionService;

    @GetMapping("/{userId}/mappings")
    public ResponseEntity<?> getUserMappings(@PathVariable String userId) {
        java.util.List<Long> divIds = userDivisionMappingRepository.findByUserId(userId).stream()
                .map(com.autonoma.erp.model.admin.UserDivisionMapping::getDivisionId)
                .collect(java.util.stream.Collectors.toList());

        java.util.List<Long> compIds = userCompanyMappingRepository.findByUserId(userId).stream()
                .map(com.autonoma.erp.model.admin.UserCompanyMapping::getCompanyId)
                .collect(java.util.stream.Collectors.toList());

        UserCredential user = userRepository.findById(userId).orElse(null);
        Integer isBosAdmin = (user != null && user.getIsBosAdmin() != null) ? user.getIsBosAdmin() : 0;

        Map<String, Object> result = new HashMap<>();
        result.put("mappedDivisionIds", divIds);
        result.put("mappedCompanyIds", compIds);
        result.put("isBosAdmin", isBosAdmin);

        return ResponseEntity.ok(result);
    }

    public static class UserMappingPayload {
        private java.util.List<Long> mappedDivisionIds;
        private Integer isBosAdmin;

        public java.util.List<Long> getMappedDivisionIds() {
            return mappedDivisionIds;
        }

        public void setMappedDivisionIds(java.util.List<Long> mappedDivisionIds) {
            this.mappedDivisionIds = mappedDivisionIds;
        }

        public Integer getIsBosAdmin() {
            return isBosAdmin;
        }

        public void setIsBosAdmin(Integer isBosAdmin) {
            this.isBosAdmin = isBosAdmin;
        }
    }

    @PostMapping("/{userId}/mappings")


    @RequirePagePermission(pageCode = "AD1130", action = "write")
    public ResponseEntity<?> updateUserMappings(@PathVariable String userId, @RequestBody UserMappingPayload payload) {
        UserCredential user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setIsBosAdmin(payload.getIsBosAdmin() != null ? payload.getIsBosAdmin() : 0);
        userRepository.save(user);

        userDivisionMappingRepository.deleteByUserId(userId);
        userCompanyMappingRepository.deleteByUserId(userId);

        if (payload.getIsBosAdmin() == null || payload.getIsBosAdmin() == 0) {
            if (payload.getMappedDivisionIds() != null && !payload.getMappedDivisionIds().isEmpty()) {
                java.util.Set<Long> companyIds = new java.util.HashSet<>();

                for (Long divId : payload.getMappedDivisionIds()) {
                    com.autonoma.erp.model.admin.UserDivisionMapping divMapping = new com.autonoma.erp.model.admin.UserDivisionMapping();
                    divMapping.setUserId(userId);
                    divMapping.setDivisionId(divId);
                    divMapping.setCreatedBy(getCurrentUserId());
                    divMapping.setCreatedAt(new Date());
                    userDivisionMappingRepository.save(divMapping);

                    divisionService.findById(divId).ifPresent(div -> {
                        if (div.getCompanyId() != null) {
                            companyIds.add(div.getCompanyId());
                        }
                    });
                }

                for (Long compId : companyIds) {
                    com.autonoma.erp.model.admin.UserCompanyMapping compMapping = new com.autonoma.erp.model.admin.UserCompanyMapping();
                    compMapping.setUserId(userId);
                    compMapping.setCompanyId(compId);
                    compMapping.setCreatedBy(getCurrentUserId());
                    compMapping.setCreatedAt(new Date());
                    userCompanyMappingRepository.save(compMapping);
                }
            }
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "User mappings updated successfully");
        return ResponseEntity.ok(res);
    }
}
