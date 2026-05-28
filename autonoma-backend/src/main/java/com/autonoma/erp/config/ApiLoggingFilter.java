package com.autonoma.erp.config;

import com.autonoma.erp.util.LogContextHolder;
import com.autonoma.erp.util.SecurityUtils;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("API_LOGGER");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        
        // Match ONLY our target modules (QMS, Checklist, Audit, Induction)
        boolean isTargetModule = uri.startsWith("/api/qms") || 
                                 uri.startsWith("/api/master/qms") ||
                                 uri.startsWith("/api/induction") ||
                                 uri.startsWith("/api/master/induction") ||
                                 uri.startsWith("/api/checklist") ||
                                 uri.startsWith("/api/master/checklist");

        if (!isTargetModule) {
            filterChain.doFilter(request, response);
            return;
        }

        // Identify current module name
        String module = "QMS";
        if (uri.contains("/induction")) {
            module = "INDUCTION";
        } else if (uri.contains("/checklist")) {
            module = "CHECKLIST";
        } else if (uri.contains("/audit")) {
            module = "AUDIT";
        }

        // Initialize logging context
        LogContextHolder.initContext(module);

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // 1. Log Request
            String method = wrappedRequest.getMethod();
            String user = SecurityUtils.getCurrentUserId();
            if (user == null) {
                user = "ANONYMOUS";
            }
            
            String requestPayload = "";
            byte[] requestBody = wrappedRequest.getContentAsByteArray();
            if (requestBody.length > 0) {
                requestPayload = new String(requestBody, StandardCharsets.UTF_8);
                // Truncate if too long to keep logs readable
                if (requestPayload.length() > 1000) {
                    requestPayload = requestPayload.substring(0, 1000) + "... [truncated]";
                }
            } else {
                requestPayload = "{}";
            }

            log.info("[API_REQUEST] [{}] [{}] - User: {}, Payload: {}", method, uri, user, requestPayload.replaceAll("\\s+", " "));

            // 2. Log Response
            int status = wrappedResponse.getStatus();
            log.info("[API_RESPONSE] [{}] [{}] - Status: {}, Duration: {}ms", method, uri, status, duration);

            // Copy back cached response content to client
            wrappedResponse.copyBodyToResponse();
            LogContextHolder.clear();
        }
    }
}
