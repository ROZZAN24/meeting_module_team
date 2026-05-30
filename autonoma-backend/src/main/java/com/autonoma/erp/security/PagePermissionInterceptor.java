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

    @Autowired
    private com.autonoma.erp.repository.admin.UserRepository userRepo;

    @Autowired
    private com.autonoma.erp.repository.QmsMeetingScheduleRepository scheduleRepo;

    @Autowired
    private com.autonoma.erp.repository.QmsMomMasterRepository momRepo;

    @Around("@annotation(permission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePagePermission permission) throws Throwable {
        String userId = SecurityUtils.getCurrentUserId();

        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        boolean allowed = authService.hasPermission(userId, permission.pageCode(), permission.action());

        if (!allowed && ("QM1320".equals(permission.pageCode()) || "QM1330".equals(permission.pageCode())) && "write".equalsIgnoreCase(permission.action())) {
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof com.autonoma.erp.model.QmsMomMaster) {
                    com.autonoma.erp.model.QmsMomMaster mom = (com.autonoma.erp.model.QmsMomMaster) arg;
                    Long scheduleId = null;
                    if (mom.getSchedule() != null && mom.getSchedule().getId() != null) {
                        scheduleId = mom.getSchedule().getId();
                    } else if (mom.getId() != null) {
                        java.util.Optional<com.autonoma.erp.model.QmsMomMaster> existingMomOpt = momRepo.findById(mom.getId());
                        if (existingMomOpt.isPresent() && existingMomOpt.get().getSchedule() != null) {
                            scheduleId = existingMomOpt.get().getSchedule().getId();
                        }
                    }
                    if (scheduleId != null) {
                        java.util.Optional<com.autonoma.erp.model.QmsMeetingSchedule> scheduleOpt = scheduleRepo.findById(scheduleId);
                        if (scheduleOpt.isPresent() && scheduleOpt.get().getHostBy() != null) {
                            Long hostEmpId = scheduleOpt.get().getHostBy().getId();
                            java.util.Optional<com.autonoma.erp.model.admin.UserCredential> userOpt = userRepo.findByUserId(userId);
                            if (userOpt.isPresent() && userOpt.get().getEmpId() != null && userOpt.get().getEmpId().equals(hostEmpId)) {
                                allowed = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!allowed) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, 
                String.format("You do not have '%s' permission on page '%s'", permission.action(), permission.pageCode()));
        }

        return joinPoint.proceed();
    }
}
