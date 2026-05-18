package com.autonoma.erp.config;

<<<<<<< HEAD
import com.autonoma.erp.model.CustomerMaster;
import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.CustomerMasterRepository;
import com.autonoma.erp.repository.admin.UserRepository;

=======
import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.model.CustomerMaster;
import com.autonoma.erp.repository.UserRepository;
import com.autonoma.erp.repository.CustomerMasterRepository;
>>>>>>> origin/chore/repo-cleanup
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
    private CustomerMasterRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
<<<<<<< HEAD
        Optional<UserCredential> existingAdmin = userRepository.findByUserId("Admin");
        UserCredential admin;
        if (existingAdmin.isEmpty()) {
            admin = new UserCredential();
            admin.setUserId("Admin");
=======
        Optional<UserCredential> existingAdmin = userRepository.findByUserId("admin");
        UserCredential admin;
        if (existingAdmin.isEmpty()) {
            admin = new UserCredential();
            admin.setUserId("admin");
>>>>>>> origin/chore/repo-cleanup
            admin.setEmpId(1L);
            admin.setCreatedBy("SYSTEM");
            admin.setCreatedDate(new Date());
            System.out.println("Creating new admin user...");
        } else {
            admin = existingAdmin.get();
            System.out.println("Updating existing admin user...");
        }
<<<<<<< HEAD

=======
        
>>>>>>> origin/chore/repo-cleanup
        // Use the new reversible encoder
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setStatus(1);
        userRepository.save(admin);
        System.out.println("Admin password initialized/updated with reversible encryption.");

        // Seed Sample Customers if none exist
        if (customerRepository.count() == 0) {
            System.out.println("Seeding sample customers...");
            customerRepository.save(CustomerMaster.builder()
                    .customerCode("CUST001")
                    .customerName("TechSprint Solutions")
                    .invoiceName("TechSprint Solutions Pvt Ltd")
                    .shortName("TechSprint")
                    .gstin("33AABCT1234A1Z1")
                    .city("Chennai")
                    .state("Tamil Nadu")
                    .country("India")
                    .status("Active")
                    .build());

            customerRepository.save(CustomerMaster.builder()
                    .customerCode("CUST002")
                    .customerName("Global Wind Systems")
                    .invoiceName("Global Wind Systems LLC")
                    .shortName("GlobalWind")
                    .gstin("29AABCG5678B1Z2")
                    .city("Bangalore")
                    .state("Karnataka")
                    .country("India")
                    .status("Active")
                    .build());

            customerRepository.save(CustomerMaster.builder()
                    .customerCode("CUST003")
                    .customerName("Nutech Energy")
                    .invoiceName("Nutech Energy Corp")
                    .shortName("Nutech")
                    .gstin("27AABCH9012C1Z3")
                    .city("Pune")
                    .state("Maharashtra")
                    .country("India")
                    .status("Active")
                    .build());
            System.out.println("Sample customers seeded.");
        }
    }
}
