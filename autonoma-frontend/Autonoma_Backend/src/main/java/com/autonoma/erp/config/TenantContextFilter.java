package com.autonoma.erp.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class TenantContextFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String tenantId = req.getHeader("X-Tenant-ID");
        String divisionIdStr = req.getHeader("X-Division-ID");

        try {
            if (tenantId != null && !tenantId.trim().isEmpty()) {
                TenantContextHolder.setTenantId(tenantId.trim());
            }
            if (divisionIdStr != null && !divisionIdStr.trim().isEmpty()) {
                try {
                    DivisionContextHolder.setDivisionId(Long.parseLong(divisionIdStr.trim()));
                } catch (NumberFormatException ignored) {
                }
            }
            chain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
            DivisionContextHolder.clear();
        }
    }
}
