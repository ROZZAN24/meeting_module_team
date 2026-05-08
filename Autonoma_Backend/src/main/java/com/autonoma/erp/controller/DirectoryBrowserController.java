package com.autonoma.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/directory")
@CrossOrigin(origins = "*")
public class DirectoryBrowserController {

    @GetMapping("/roots")
    public ResponseEntity<List<String>> getRoots() {
        List<String> roots = new ArrayList<>();
        File[] drives = File.listRoots();
        if (drives != null) {
            for (File drive : drives) {
                roots.add(drive.getAbsolutePath());
            }
        }
        return ResponseEntity.ok(roots);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listDirectory(@RequestParam(required = false) String path) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (path == null || path.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Path is required"));
            }

            File dir = new File(path);
            if (!dir.exists() || !dir.isDirectory()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Path does not exist or is not a directory"));
            }

            List<Map<String, String>> folders = new ArrayList<>();
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory() && !file.isHidden()) {
                        Map<String, String> folderInfo = new HashMap<>();
                        folderInfo.put("name", file.getName());
                        folderInfo.put("path", file.getAbsolutePath());
                        folders.add(folderInfo);
                    }
                }
            }

            response.put("currentPath", dir.getAbsolutePath());
            response.put("parentPath", dir.getParent());
            response.put("folders", folders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
