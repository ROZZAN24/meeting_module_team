package com.autonoma.erp.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static String getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                Object principal = auth.getPrincipal();
                String username = null;
                
                if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                } else {
                    username = auth.getName();
                }
                
                if (username != null && !username.isEmpty()) {
                    return username;
                }
            }
        } catch (Exception e) {
            // Log error if possible, but always return a fallback
        }
        return "SYSTEM";
    }
}
