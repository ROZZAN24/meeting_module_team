package com.autonoma.erp.config;

import com.autonoma.erp.service.admin.TenantDataSourceService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class TenantContextFilter implements Filter {

    @Autowired
    private TenantDataSourceService tenantDataSourceService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String tenantId = req.getHeader("X-Tenant-ID");
        String divisionIdStr = req.getHeader("X-Division-ID");

        String uri = req.getRequestURI();
        if (uri.startsWith("/api/users") || 
            uri.startsWith("/api/account") || 
            uri.startsWith("/api/user-page-auth") || 
            uri.startsWith("/api/bos-pages") || 
            uri.startsWith("/api/preferences") || 
            uri.startsWith("/api/theme-settings") || 
            uri.startsWith("/api/company-profile") || 
            uri.startsWith("/api/prefix-credentials") || 
            uri.startsWith("/api/audit-trail") || 
            uri.startsWith("/api/analytics/sessions") || 
            uri.startsWith("/api/audit/sessions")) {
            tenantId = "AUTONOMA";
        }

        try {
            if (tenantId != null && !tenantId.trim().isEmpty() && !tenantId.equalsIgnoreCase("AUTONOMA")) {
                try {
                    tenantDataSourceService.createTenantDataSource(tenantId.trim());
                    TenantContextHolder.setTenantId(tenantId.trim());
                } catch (Exception e) {
                    // Fallback if datasource creation fails
                    TenantContextHolder.setTenantId("AUTONOMA");
                }
            } else {
                TenantContextHolder.setTenantId("AUTONOMA");
            }

            if (divisionIdStr != null && !divisionIdStr.trim().isEmpty()) {
                try {
                    DivisionContextHolder.setDivisionId(Long.parseLong(divisionIdStr.trim()));
                } catch (NumberFormatException ignored) {
                }
            }

            try {
                chain.doFilter(request, response);
            } catch (Exception e) {
                // If the request fails specifically due to a connection issue with the tenant DB,
                // and we haven't already fallen back, we might want to log it.
                // However, usually the exception will propagate up to the GlobalExceptionHandler.
                throw e;
            }
        } finally {
            TenantContextHolder.clear();
            DivisionContextHolder.clear();
        }
    }
}
