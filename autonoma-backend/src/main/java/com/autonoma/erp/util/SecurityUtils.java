package com.autonoma.erp.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

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
                java.util.Optional<com.autonoma.erp.model.admin.UserCredential> userOpt = userRepo.findByUserId(principalId);
                if (!userOpt.isPresent()) {
                    userOpt = userRepo.findAll().stream()
                            .filter(u -> u.getUserId().equalsIgnoreCase(principalId))
                            .findFirst();
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
}
