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

    @Autowired
    private com.autonoma.erp.repository.EmployeeMasterRepository employeeMasterRepository;

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

        // Auto-seed QMS Statuses if empty to prevent NULL status assignments
        try {
            System.out.println("[QMS DB Fix] Seeding QMS Statuses in AD_STATUS_MASTER if missing...");
            String[] qmsStatuses = {
                "Pending", "Started", "Unresolved", "Missed", "Completed",
                "Not Completed", "25%", "50%", "75%", "Pending for Verified",
                "Verified", "Pending for Accepted", "Accepted", "Attended", "Rejected", "Open"
            };
            for (String statusName : qmsStatuses) {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM AD_STATUS_MASTER WHERE NAME = ?", Integer.class, statusName);
                if (count == null || count == 0) {
                    jdbcTemplate.update("INSERT INTO AD_STATUS_MASTER (NAME) VALUES (?)", statusName);
                    System.out.println("[QMS DB Fix] Seeded status: " + statusName);
                }
            }
        } catch (Exception ex) {
            System.out.println("[QMS DB Fix] Seeding QMS Statuses failed: " + ex.getMessage());
        }

        // Self-healing: Drop ALL legacy QMS Checklist frequency tables and deprecated tables
        // These were created by V50/V52 migration scripts before they were added to H2 skip list.
        // V53 (Drop deprecated) and V54 (Consolidate) were skipped for H2 due to T-SQL syntax.
        // This block permanently enforces the final 5-table architecture on every startup.
        try {
            System.out.println("[QMS DB Fix] Starting self-healing schema cleanup for H2...");

            // ── Step 1: Drop all legacy frequency-based closed tables (replaced by QMS_CHECKLIST_CLOSED) ──
            String[] legacyFrequencyTables = {
                "QMS_CHECKLIST_CLOSED_DAILY",
                "QMS_CHECKLIST_CLOSED_WEEKLY",
                "QMS_CHECKLIST_CLOSED_FORTNIGHTLY",
                "QMS_CHECKLIST_CLOSED_MONTHLY",
                "QMS_CHECKLIST_CLOSED_QUARTERLY",
                "QMS_CHECKLIST_CLOSED_HALF_YEARLY",
                "QMS_CHECKLIST_CLOSED_YEARLY",
                "QMS_CHECKLIST_CLOSED_CUSTOM"
            };
            for (String legacyTable : legacyFrequencyTables) {
                try {
                    jdbcTemplate.execute("DROP TABLE IF EXISTS " + legacyTable);
                    System.out.println("[QMS DB Fix] Dropped legacy table: " + legacyTable);
                } catch (Exception ex) {
                    System.out.println("[QMS DB Fix] Could not drop " + legacyTable + ": " + ex.getMessage());
                }
            }

            // ── Step 2: Drop QMS_CHECKLIST_VERIFICATION (superseded by columns in QMS_CHECKLIST_CLOSED) ──
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS QMS_CHECKLIST_VERIFICATION");
                System.out.println("[QMS DB Fix] Dropped deprecated table: QMS_CHECKLIST_VERIFICATION");
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] Could not drop QMS_CHECKLIST_VERIFICATION: " + ex.getMessage());
            }

            // ── Step 3: Drop the old legacy pre-migration table ──
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS QMS_MASTER_CHECKLIST CASCADE");
                System.out.println("[QMS DB Fix] Dropped obsolete table QMS_MASTER_CHECKLIST");
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] Dropping obsolete table QMS_MASTER_CHECKLIST skipped: " + ex.getMessage());
            }

            // ── Step 4: Drop stale FK constraints referencing removed tables ──
            String[] tablesWithStaleConstraints = {
                "QMS_CHECKLIST_ASSIGNMENT", "qms_checklist_assignment",
                "QMS_CHECKLIST_DEPARTMENT", "qms_checklist_department"
            };
            String[] staleConstraints = {
                "FK9GLT0I2UPGH0V6C3W3SHK90EF",
                "FK_Assignment_Checklist",
                "FK_Assignment_Checklist_Master",
                "FK_Dept_Checklist",
                "FK_Dept_Checklist_Master",
                "FKMKOR0WTRYERIKOC8PFCEYDGAB",
                "FK_Verification_Assignment",
                "FK_VERIFICATION_ASSIGNMENT",
                "FK_Verification_Assignment_Master"
            };
            for (String tbl : tablesWithStaleConstraints) {
                for (String constraint : staleConstraints) {
                    try {
                        jdbcTemplate.execute("ALTER TABLE " + tbl + " DROP CONSTRAINT IF EXISTS " + constraint);
                    } catch (Exception ex) {
                        // ignore — constraint may not exist
                    }
                }
            }
            System.out.println("[QMS DB Fix] Cleaned up all stale FK constraints.");

            // ── Step 5: Ensure correct FK constraints on final active tables ──
            try {
                jdbcTemplate.execute("ALTER TABLE qms_checklist_assignment ADD CONSTRAINT FK_Assignment_Checklist_Master FOREIGN KEY (CHECKLIST_ID) REFERENCES qms_checklist_master(id) ON DELETE CASCADE");
                System.out.println("[QMS DB Fix] Added FK_Assignment_Checklist_Master -> qms_checklist_master");
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] FK_Assignment_Checklist_Master skipped/already exists: " + ex.getMessage());
            }
            try {
                jdbcTemplate.execute("ALTER TABLE qms_checklist_department ADD CONSTRAINT FK_Dept_Checklist_Master FOREIGN KEY (CHECKLIST_ID) REFERENCES qms_checklist_master(id) ON DELETE CASCADE");
                System.out.println("[QMS DB Fix] Added FK_Dept_Checklist_Master -> qms_checklist_master");
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] FK_Dept_Checklist_Master skipped/already exists: " + ex.getMessage());
            }

            // ── Step 6: Self-healing H2 data sync from QMS_CHECKLIST_MASTER to QMS_CHECKLIST ──
            try {
                Integer countChecklist = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM QMS_CHECKLIST", Integer.class);
                if (countChecklist == null || countChecklist == 0) {
                    System.out.println("[QMS DB Fix] QMS_CHECKLIST is empty. Syncing from QMS_CHECKLIST_MASTER...");
                    Integer countMaster = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE UPPER(TABLE_NAME) = 'QMS_CHECKLIST_MASTER'", Integer.class);
                    if (countMaster != null && countMaster > 0) {
                        Integer masterRows = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM QMS_CHECKLIST_MASTER", Integer.class);
                        if (masterRows != null && masterRows > 0) {
                            jdbcTemplate.execute(
                                "INSERT INTO QMS_CHECKLIST (" +
                                "  id, seq_no, checking_point, description, category, frequency, " +
                                "  week_days, repeat_every_value, repeat_every_unit, effective_from, " +
                                "  expiry_date, reminder_days, reminder_date, stock_link, photo_required, " +
                                "  verification_required, last_completed_date, next_due_date, dual_check, " +
                                "  carry_forward, carry_forward_status, amendment_reason, level_ids, " +
                                "  uploaded_files, scanned_files, status, task_status, verify_status, " +
                                "  verified_by, verified_date, rej_reason, assign_to, assign_date, " +
                                "  item_code, qty, is_active, created_user, created_date, updated_user, updated_date" +
                                ") SELECT " +
                                "  id, seq_no, checking_point, description, category, frequency, " +
                                "  week_days, repeat_every_value, repeat_every_unit, effective_from, " +
                                "  expiry_date, reminder_days, reminder_date, stock_link, photo_required, " +
                                "  verification_required, last_completed_date, next_due_date, dual_check, " +
                                "  carry_forward, carry_forward_status, amendment_reason, level_ids, " +
                                "  uploaded_files, scanned_files, status, task_status, verify_status, " +
                                "  verified_by, verified_date, rej_reason, assign_to, assign_date, " +
                                "  item_code, qty, TRUE, created_user, created_date, updated_user, updated_date " +
                                "FROM QMS_CHECKLIST_MASTER"
                            );
                            System.out.println("[QMS DB Fix] Successfully copied " + masterRows + " records from QMS_CHECKLIST_MASTER to QMS_CHECKLIST.");
                        }
                    }
                }
            } catch (Exception ex) {
                System.out.println("[QMS DB Fix] Self-healing copy failed: " + ex.getMessage());
            }

            System.out.println("[QMS DB Fix] ✅ Final 5-table schema enforced successfully!");
        } catch (Exception e) {
            System.out.println("[QMS DB Fix] Self-healing cleanup failed: " + e.getMessage());
        }

        Optional<UserCredential> existingAdmin = userRepository.findByUserId("Admin");
        UserCredential admin;
        if (existingAdmin.isEmpty()) {
            admin = new UserCredential();
            admin.setUserId("Admin");
            admin.setCreatedBy("SYSTEM");
            admin.setCreatedDate(new Date());
            System.out.println("Creating new admin user...");
        } else {
            admin = existingAdmin.get();
            System.out.println("Updating existing admin user...");
        }

        // Set or update a dedicated Administrator employee record to completely separate it from other users
        com.autonoma.erp.model.EmployeeMaster adminEmp = null;
        java.util.List<com.autonoma.erp.model.EmployeeMaster> emps = employeeMasterRepository.findAll();
        for (com.autonoma.erp.model.EmployeeMaster e : emps) {
            if ("ADMIN_EMP".equals(e.getEmpCode())) {
                adminEmp = e;
                break;
            }
        }
        if (adminEmp == null) {
            adminEmp = new com.autonoma.erp.model.EmployeeMaster();
            adminEmp.setEmpCode("ADMIN_EMP");
            adminEmp.setEmployeeName("Administrator");
            adminEmp.setFirstName("Admin");
            adminEmp.setLastName("istrator");
            adminEmp.setStatus("Active");
            adminEmp = employeeMasterRepository.save(adminEmp);
        }
        admin.setEmpId(adminEmp.getId());

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
