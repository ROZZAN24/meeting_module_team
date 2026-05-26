package com.autonoma.erp.config;

import com.autonoma.erp.model.CustomerMaster;
import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.CustomerMasterRepository;
import com.autonoma.erp.repository.admin.UserRepository;

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

    @Autowired
    private com.autonoma.erp.repository.admin.CompanyCredentialRepository companyCredentialRepository;

    @Autowired
    private com.autonoma.erp.repository.DivisionRepository divisionRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.UserCompanyMappingRepository userCompanyMappingRepository;

    @Autowired
    private com.autonoma.erp.repository.admin.UserDivisionMappingRepository userDivisionMappingRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("[DB Dump] Dumping QMS_CHECKLIST_MASTER table...");
            java.util.List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM QMS_CHECKLIST_MASTER");
            StringBuilder sb = new StringBuilder();
            sb.append("Columns and values in QMS_CHECKLIST_MASTER:\n");
            for (java.util.Map<String, Object> r : rows) {
                sb.append("Row:\n");
                for (java.util.Map.Entry<String, Object> entry : r.entrySet()) {
                    sb.append("  ").append(entry.getKey()).append(" = ").append(entry.getValue()).append("\n");
                }
            }
            java.nio.file.Files.writeString(java.nio.file.Path.of("db_checklist_dump.txt"), sb.toString());
            System.out.println("[DB Dump] Dump written successfully to db_checklist_dump.txt");
        } catch (Exception ex) {
            System.out.println("[DB Dump] Failed to dump: " + ex.getMessage());
        }

        // Self-healing database migration for local H2: drop all stale constraints referencing the old QMS_MASTER_CHECKLIST table
        try {
            // 1. Direct drop of known stale constraints to be absolutely sure
            try {
                jdbcTemplate.execute("ALTER TABLE QMS_CHECKLIST_DEPARTMENT DROP CONSTRAINT IF EXISTS FKMKOR0WTRYERIKOC8PFCEYDGAB");
                System.out.println("[QMS DB Fix] Attempted direct drop of FKMKOR0WTRYERIKOC8PFCEYDGAB on QMS_CHECKLIST_DEPARTMENT");
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] Direct drop of FKMKOR0WTRYERIKOC8PFCEYDGAB skipped: " + ex.getMessage());
            }

            // 2. Dynamic check using H2 v2 column names (FK_NAME)
            try {
                java.util.List<java.util.Map<String, Object>> staleFKs = jdbcTemplate.queryForList(
                    "SELECT FK_NAME AS CONSTRAINT_NAME, FKTABLE_NAME AS TABLE_NAME FROM INFORMATION_SCHEMA.CROSS_REFERENCES WHERE UPPER(PKTABLE_NAME) = 'QMS_MASTER_CHECKLIST'"
                );
                for (java.util.Map<String, Object> fk : staleFKs) {
                    String constName = (String) fk.get("CONSTRAINT_NAME");
                    String tableName = (String) fk.get("TABLE_NAME");
                    if (constName != null && tableName != null) {
                        jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constName);
                        System.out.println("[QMS DB Fix] Dynamic H2-v2: Dropped stale foreign key " + constName + " on " + tableName + " referencing old QMS_MASTER_CHECKLIST table.");
                    }
                }
            } catch (Exception ex2) {
                System.out.println("[QMS DB Fix] Dynamic H2-v2 constraint clean-up skipped: " + ex2.getMessage());
            }

            // 3. Dynamic check using traditional column names (CONSTRAINT_NAME)
            try {
                java.util.List<java.util.Map<String, Object>> staleFKs = jdbcTemplate.queryForList(
                    "SELECT CONSTRAINT_NAME, FKTABLE_NAME AS TABLE_NAME FROM INFORMATION_SCHEMA.CROSS_REFERENCES WHERE UPPER(PKTABLE_NAME) = 'QMS_MASTER_CHECKLIST'"
                );
                for (java.util.Map<String, Object> fk : staleFKs) {
                    String constName = (String) fk.get("CONSTRAINT_NAME");
                    String tableName = (String) fk.get("TABLE_NAME");
                    if (constName != null && tableName != null) {
                        jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP CONSTRAINT IF EXISTS " + constName);
                        System.out.println("[QMS DB Fix] Dynamic traditional: Dropped stale foreign key " + constName + " on " + tableName + " referencing old QMS_MASTER_CHECKLIST table.");
                    }
                }
            } catch (Exception ex3) {
                // Ignore traditional query failures as they are expected under H2 v2
            }
        } catch (Exception e) {
            System.out.println("[QMS DB Fix] Stale H2 constraint clean-up skipped: " + e.getMessage());
        }

        Optional<UserCredential> existingAdmin = userRepository.findByUserId("Admin");
        UserCredential admin;
        if (existingAdmin.isEmpty()) {
            admin = new UserCredential();
            admin.setUserId("Admin");
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
        admin.setIsBosAdmin(1); // Set as Super User
        userRepository.save(admin);
        System.out.println("Admin password initialized/updated with reversible encryption and superuser privileges.");

        // Seed default company if empty
        com.autonoma.erp.model.admin.CompanyCredential company = null;
        if (companyCredentialRepository.count() == 0) {
            System.out.println("Seeding default company...");
            company = new com.autonoma.erp.model.admin.CompanyCredential();
            company.setCompanyName("Autonoma ERP Solutions");
            company.setShortName("Autonoma");
            company.setAddress("123 Tech Park");
            company.setCity("Bangalore");
            company.setState("Karnataka");
            company.setStateCode(29);
            company.setCountry("India");
            company.setPincode("560001");
            company.setGstIn("29AAAAA0000A1Z5");
            company.setDbSourceName("AUTONOMA");
            company.setDirectoryPath("/uploads");
            company.setCreatedBy("System");
            company.setCreatedDate(new Date());
            company.setLicExpRemainderDays(365);
            company.setRestoreEnableDays(7);
            
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.add(java.util.Calendar.YEAR, 5);
            company.setLicExpiryDate(cal.getTime());
            
            company = companyCredentialRepository.save(company);
            System.out.println("Default company seeded: " + company.getCompanyName());
        } else {
            company = companyCredentialRepository.findAll().get(0);
        }

        // Seed default division if empty
        com.autonoma.erp.model.Division division = null;
        if (divisionRepository.count() == 0 && company != null) {
            System.out.println("Seeding default division...");
            division = new com.autonoma.erp.model.Division();
            division.setCompanyId(company.getId());
            division.setDivisionName("Bangalore Division");
            division.setDescription("Primary Division");
            division.setAddress("123 Tech Park");
            division.setCity("Bangalore");
            division.setState("Karnataka");
            division.setCountry("India");
            division.setPincode("560001");
            division.setGstIn("29AAAAA0000A1Z5");
            division.setStateCode(29);
            division.setStatus(true);
            division.setCreatedBy("System");
            
            division = divisionRepository.save(division);
            System.out.println("Default division seeded: " + division.getDivisionName());
        } else if (divisionRepository.count() > 0) {
            division = divisionRepository.findAll().get(0);
        }

        // Seed mappings for Admin
        if (company != null && userCompanyMappingRepository.findByUserId("Admin").isEmpty()) {
            System.out.println("Mapping Admin to default company...");
            com.autonoma.erp.model.admin.UserCompanyMapping mapping = new com.autonoma.erp.model.admin.UserCompanyMapping();
            mapping.setUserId("Admin");
            mapping.setCompanyId(company.getId());
            mapping.setCreatedBy("SYSTEM");
            userCompanyMappingRepository.save(mapping);
        }

        if (division != null && userDivisionMappingRepository.findByUserId("Admin").isEmpty()) {
            System.out.println("Mapping Admin to default division...");
            com.autonoma.erp.model.admin.UserDivisionMapping mapping = new com.autonoma.erp.model.admin.UserDivisionMapping();
            mapping.setUserId("Admin");
            mapping.setDivisionId(division.getId());
            mapping.setCreatedBy("SYSTEM");
            userDivisionMappingRepository.save(mapping);
        }

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
