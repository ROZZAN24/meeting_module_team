package com.autonoma.erp.util;

import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.model.UserCredential;
import com.autonoma.erp.repository.EmployeeMasterRepository;
import com.autonoma.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Utility to resolve logged-in user's identity to their EmployeeMaster record.
 * Chain: JWT userId → UserCredential.empId → EmployeeMaster
 */
@Component
public class AuthHelper {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EmployeeMasterRepository empRepo;

    /**
     * Get the full EmployeeMaster for the currently logged-in user.
     */
    public EmployeeMaster getEmployee(Principal principal) {
        if (principal == null) return null;
        String userId = principal.getName();
        UserCredential user = userRepo.findByUserId(userId)
                .orElse(null);
        if (user == null || user.getEmpId() == null) return null;
        return empRepo.findById(user.getEmpId()).orElse(null);
    }

    /**
     * Get the empCode for the currently logged-in user.
     */
    public String getEmpCode(Principal principal) {
        EmployeeMaster emp = getEmployee(principal);
        return emp != null ? emp.getEmpCode() : null;
    }

    /**
     * Check if the current user is an admin (isBosAdmin = 1).
     */
    public boolean isAdmin(Principal principal) {
        if (principal == null) return false;
        String userId = principal.getName();
        return userRepo.findByUserId(userId)
                .map(u -> u.getIsBosAdmin() != null && u.getIsBosAdmin() == 1)
                .orElse(false);
    }

    /**
     * Get the userId string from the principal.
     */
    public String getUserId(Principal principal) {
        return principal != null ? principal.getName() : "SYSTEM";
    }
}
