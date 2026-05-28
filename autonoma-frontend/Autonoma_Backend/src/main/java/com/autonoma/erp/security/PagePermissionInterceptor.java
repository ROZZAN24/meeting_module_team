package com.autonoma.erp.security;

import com.autonoma.erp.service.admin.BosUserPageAuthService;
import com.autonoma.erp.util.SecurityUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * AOP-based permission interceptor for BOS page-level API security.
 * 
 * Any controller method annotated with @RequirePagePermission will be intercepted.
 * The interceptor extracts the current user from the JWT security context,
 * checks if they have the required permission on the specified page,
 * and returns 403 Forbidden if not authorized.
 * 
 * Example:
 * <pre>
 * {@literal @}RequirePagePermission(pageCode = "M3110", action = "delete")
 * {@literal @}DeleteMapping("/{id}")
 * public ResponseEntity<?> delete(@PathVariable Long id) { ... }
 * </pre>
 */
@Aspect
@Component
public class PagePermissionInterceptor {

    @Autowired
    private BosUserPageAuthService authService;

    @Around("@annotation(permission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePagePermission permission) throws Throwable {
        String userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }

        boolean allowed = authService.hasPermission(userId, permission.pageCode(), permission.action());

        if (!allowed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", "Access denied",
                            "pageCode", permission.pageCode(),
                            "action", permission.action(),
                            "message", String.format("You do not have '%s' permission on page '%s'",
                                    permission.action(), permission.pageCode())
                    ));
        }

        return joinPoint.proceed();
    }
}
