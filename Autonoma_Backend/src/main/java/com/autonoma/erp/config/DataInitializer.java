package com.autonoma.erp.config;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Optional<UserCredential> existingAdmin = userRepository.findByUserId("admin");
        if (existingAdmin.isEmpty()) {
            UserCredential admin = new UserCredential();
            admin.setUserId("admin");
            admin.setEmpId(1);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatus(1);
            admin.setCreatedBy("SYSTEM");
            admin.setCreatedDate(new Date());
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        } else {
            // Always re-encode the password on startup to stay in sync
            UserCredential admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatus(1);
            userRepository.save(admin);
            System.out.println("Admin password re-synced on startup.");
        }
    }
}
