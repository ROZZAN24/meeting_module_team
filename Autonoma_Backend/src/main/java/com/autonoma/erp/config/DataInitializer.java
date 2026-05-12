package com.autonoma.erp.config;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Optional;

import org.springframework.core.annotation.Order;

@Component
@Order(2)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Optional<UserCredential> existingAdmin = userRepository.findByUserId("admin");
        UserCredential admin;
        if (existingAdmin.isEmpty()) {
            admin = new UserCredential();
            admin.setUserId("admin");
            admin.setEmpId(1L);
            admin.setCreatedBy("SYSTEM");
            admin.setCreatedDate(new Date());
            System.out.println("Creating new admin user...");
        } else {
            admin = existingAdmin.get();
            System.out.println("Updating existing admin user...");
        }

        // Use the new reversible encoder
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setStatus(1);
        userRepository.save(admin);
        System.out.println("Admin password initialized/updated with reversible encryption.");
    }
}
