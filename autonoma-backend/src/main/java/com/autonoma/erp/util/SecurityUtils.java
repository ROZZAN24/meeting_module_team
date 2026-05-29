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

    public static String getCurrentUserDisplayName() {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                return null;
            }
            if (userRepository != null && employeeRepository != null) {
                String originalTenant = com.autonoma.erp.config.TenantContextHolder.getTenantId();
                try {
                    com.autonoma.erp.config.TenantContextHolder.setTenantId("AUTONOMA");
                    Optional<UserCredential> userOpt = userRepository.findByUserId(userId);
                    if (!userOpt.isPresent()) {
                        userOpt = userRepository.findAll().stream()
                                .filter(u -> u.getUserId().equalsIgnoreCase(userId))
                                .findFirst();
                    }
                    
                    if (userOpt.isPresent()) {
                        UserCredential user = userOpt.get();
                        Long empId = user.getEmpId();
                        
                        com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
                        if (empId != null) {
                            return employeeRepository.findById(empId)
                                    .map(e -> e.getEmployeeName())
                                    .orElse(userId);
                        }
                    }
                } finally {
                    com.autonoma.erp.config.TenantContextHolder.setTenantId(originalTenant);
                }
            }
            return userId;
        } catch (Exception e) {
            // Log or ignore
        }
        return null;
    }
}
