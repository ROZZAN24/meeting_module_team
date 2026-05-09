package com.autonoma.erp.service;

import com.autonoma.erp.model.CompanyCredential;
import com.autonoma.erp.repository.CompanyCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CompanyCredentialService {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "company" + File.separator;

    @Autowired
    private CompanyCredentialRepository repository;

    public List<CompanyCredential> findAll() {
        return repository.findAll();
    }

    public Optional<CompanyCredential> findById(Integer id) {
        return repository.findById(id);
    }

    public CompanyCredential save(CompanyCredential company) {
        return repository.save(company);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    /**
     * Saves uploaded file to the uploads/company directory and returns the saved filename.
     */
    public String saveUploadedFile(MultipartFile file) throws IOException {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path targetPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFilename;
    }
}
