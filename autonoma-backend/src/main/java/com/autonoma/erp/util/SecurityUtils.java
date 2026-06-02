package com.autonoma.erp.util;

import com.autonoma.erp.model.admin.UserCredential;
import com.autonoma.erp.repository.admin.UserRepository;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class SecurityUtils {

    private static UserRepository userRepository;
    private static EmployeeMasterRepository employeeRepository;

    @Autowired
    public SecurityUtils(UserRepository userRepository, EmployeeMasterRepository employeeRepository) {
        SecurityUtils.userRepository = userRepository;
        SecurityUtils.employeeRepository = employeeRepository;
    }

    public static String getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                Object principal = auth.getPrincipal();
                if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                } else {
                    return auth.getName();
                }
            }
        } catch (Exception e) {
            // Log error
        }
        return null;
    }

    private static final java.util.concurrent.ConcurrentHashMap<String, String> employeeNameCache = 
            new java.util.concurrent.ConcurrentHashMap<>();

    public static void resolveAndCacheEmployeeName(String principalId) {
        if (principalId == null || principalId.isEmpty()) {
            return;
        }

        if (employeeNameCache.containsKey(principalId)) {
            return;
        }

        try {
            com.autonoma.erp.repository.admin.UserRepository userRepo = SpringContext.getBean(com.autonoma.erp.repository.admin.UserRepository.class);
            com.autonoma.erp.repository.EmployeeMasterRepository empRepo = SpringContext.getBean(com.autonoma.erp.repository.EmployeeMasterRepository.class);

            if (userRepo != null && empRepo != null) {
                String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
                java.util.Optional<com.autonoma.erp.model.admin.UserCredential> userOpt = java.util.Optional.empty();
                try {
                    com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
                    userOpt = userRepo.findByUserId(principalId);
                    if (!userOpt.isPresent()) {
                        userOpt = userRepo.findAll().stream()
                                .filter(u -> u.getUserId().equalsIgnoreCase(principalId))
                                .findFirst();
                    }
                } finally {
                    com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
                }

                if (userOpt.isPresent()) {
                    Long empId = userOpt.get().getEmpId();
                    if (empId != null) {
                        java.util.Optional<com.autonoma.erp.model.EmployeeMaster> empOpt = empRepo.findById(empId);
                        if (empOpt.isPresent()) {
                            employeeNameCache.put(principalId, empOpt.get().getEmployeeName());
                            return;
                        }
                    }
                }

                java.util.Optional<com.autonoma.erp.model.EmployeeMaster> empOpt = empRepo.findByEmpCode(principalId);
                if (empOpt.isPresent()) {
                    employeeNameCache.put(principalId, empOpt.get().getEmployeeName());
                    return;
                }

                try {
                    Long empId = Long.parseLong(principalId);
                    empOpt = empRepo.findById(empId);
                    if (empOpt.isPresent()) {
                        employeeNameCache.put(principalId, empOpt.get().getEmployeeName());
                        return;
                    }
                } catch (NumberFormatException nfe) {
                    // Ignore
                }
            }
        } catch (Exception e) {
            // Ignore resolution errors
        }

        employeeNameCache.put(principalId, principalId);
    }

    public static String getCurrentUserEmployeeName() {
        String principalId = getCurrentUserId();
        if (principalId == null) {
            return null;
        }
        return employeeNameCache.getOrDefault(principalId, principalId);
    }

    public static String getCurrentUserDisplayName() {
        String name = getCurrentUserEmployeeName();
        // Normalize "Administrator" / "Admin istrator" to "Admin" for display consistency
        if (name != null && ("Administrator".equalsIgnoreCase(name) || "Admin istrator".equalsIgnoreCase(name))) {
            return "Admin";
        }
        return name;
    }
}
