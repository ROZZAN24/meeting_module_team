package com.autonoma.erp.controller;

import com.autonoma.erp.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("File Controller is ACTIVE. Root: " + fileService.getRootPath().toAbsolutePath());
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "module", required = false) String module) {
        try {
            String relativePath = fileService.saveFile(file, module);
            return ResponseEntity.ok(relativePath);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Could not upload the file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{*filename}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable(required = false) String filename,
            @RequestParam(value = "path", required = false) String path) {
        String finalPath = (path != null) ? path : filename;
        return serveFile(finalPath, false);
    }

    @GetMapping("/view/{*filename}")
    public ResponseEntity<Resource> viewFile(
            @PathVariable(required = false) String filename,
            @RequestParam(value = "path", required = false) String path) {
        String finalPath = (path != null) ? path : filename;
        return serveFile(finalPath, true);
    }

    private ResponseEntity<Resource> serveFile(String filename, boolean inline) {
        try {
            if (filename != null && filename.startsWith("/")) {
                filename = filename.substring(1);
            }

            String decodedFilename = java.net.URLDecoder.decode(filename,
                    java.nio.charset.StandardCharsets.UTF_8.name());
            Resource resource = fileService.loadFile(decodedFilename);

            Path filePath = resource.getFile().toPath();
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                String name = filePath.getFileName().toString().toLowerCase();
                if (name.endsWith(".pdf"))
                    contentType = "application/pdf";
                else if (name.endsWith(".png"))
                    contentType = "image/png";
                else if (name.endsWith(".jpg") || name.endsWith(".jpeg"))
                    contentType = "image/jpeg";
                else if (name.endsWith(".gif"))
                    contentType = "image/gif";
                else if (name.endsWith(".xlsx"))
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                else if (name.endsWith(".xls"))
                    contentType = "application/vnd.ms-excel";
                else if (name.endsWith(".docx"))
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                else if (name.endsWith(".doc"))
                    contentType = "application/msword";
                else
                    contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            (inline ? "inline" : "attachment") + "; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
}
