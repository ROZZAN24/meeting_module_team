package com.autonoma.erp.service;

import com.autonoma.erp.model.AppPreference;
import com.autonoma.erp.model.CompanyCredential;
import com.autonoma.erp.repository.AppPreferenceRepository;
import com.autonoma.erp.repository.CompanyCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import AppUtil.BosDocConstants;

@Service
public class UserService {

    @Autowired
    private CompanyCredentialRepository companyRepository;

    @Autowired
    private AppPreferenceRepository appPreferenceRepository;

    private Path getUploadDirectory() {
        // Priority 1: From CompanyCredential record (shared root)
        List<CompanyCredential> all = companyRepository.findAll();
        if (!all.isEmpty() && all.get(0).getDirectoryPath() != null && !all.get(0).getDirectoryPath().trim().isEmpty()) {
            return Paths.get(all.get(0).getDirectoryPath().trim());
        }

        // Priority 2: From AppPreference
        Optional<AppPreference> pref = appPreferenceRepository.findByPrefName("FILE_LOCATION");
        if (pref.isPresent() && pref.get().getPrefValue() != null && !pref.get().getPrefValue().trim().isEmpty()) {
            return Paths.get(pref.get().getPrefValue().trim());
        }

        // Fallback: Default uploads
        return Paths.get(System.getProperty("user.dir") + File.separator + "uploads");
    }

    /**
     * Saves uploaded file to the configured directory and returns the saved filename.
     */
    public String saveUploadedFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = getUploadDirectory().resolve(subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "upload";
        }

        String baseName = originalFilename;
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex != -1) {
            baseName = originalFilename.substring(0, dotIndex);
            extension = originalFilename.substring(dotIndex);
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(dtf);
        String uniqueFilename = baseName + "_" + timestamp + extension;

        Path targetPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }

    public Resource loadFileAsResource(String filename, String subDir) throws Exception {
        Path filePath = getUploadDirectory().resolve(subDir).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }
}
