package com.autonoma.erp.config;

import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUserId("admin").isEmpty()) {
            UserCredential admin = new UserCredential();
            admin.setUserId("admin");
            admin.setEmpId(1);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatus(1);
            admin.setCreatedBy("SYSTEM");
            admin.setCreatedDate(new Date());
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }
    }
}
