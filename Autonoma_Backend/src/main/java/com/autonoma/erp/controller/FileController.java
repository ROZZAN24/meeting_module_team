package com.autonoma.erp.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final Path root = Paths.get("uploads");

    public FileController() {
        try {
            System.out.println("FileController Initialized. Current Dir: " + System.getProperty("user.dir"));
            System.out.println("Uploads Root Path: " + root.toAbsolutePath());
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println("Created uploads directory at: " + root.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("File Controller is ACTIVE. Root: " + root.toAbsolutePath());
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(fileName);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not upload the file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{*filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        if (filename != null && filename.startsWith("/")) filename = filename.substring(1);
        return getFileInternal(filename);
    }

    @GetMapping("/view/{*filename}")
    public ResponseEntity<Resource> viewFile(@PathVariable String filename) {
        if (filename != null && filename.startsWith("/")) filename = filename.substring(1);
        return getFileInternal(filename);
    }

    private ResponseEntity<Resource> getFileInternal(String filename) {
        System.out.println("[FILE_CONTROLLER] Request for: " + filename);
        try {
            if (filename == null || filename.trim().isEmpty() || filename.equals("/")) {
                System.err.println("EMPTY FILENAME REQUESTED");
                return ResponseEntity.status(400).build();
            }
            
            String decodedFilename = java.net.URLDecoder.decode(filename, java.nio.charset.StandardCharsets.UTF_8.name());
            if (decodedFilename.startsWith("/")) decodedFilename = decodedFilename.substring(1);
            System.out.println("Decoded filename: " + decodedFilename);
            
            Path file = root.resolve(decodedFilename).normalize();
            if (!file.startsWith(root.toAbsolutePath().normalize())) {
                System.err.println("TRAVERSAL ATTEMPT DETECTED: " + decodedFilename);
                return ResponseEntity.status(403).build();
            }
            System.out.println("Absolute Path: " + file.toAbsolutePath());
            
            if (!Files.exists(file) || Files.isDirectory(file)) {
                System.err.println("FILE NOT FOUND OR IS DIRECTORY: " + file.toAbsolutePath());
                return ResponseEntity.status(404).build();
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                System.out.println("Resource is valid and readable");
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                System.out.println("Serving file with content type: " + contentType);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.err.println("Resource exists check failed for: " + file.toAbsolutePath());
                return ResponseEntity.status(404).build();
            }
        } catch (Exception e) {
            System.err.println("ERROR SERVING FILE: " + filename);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
