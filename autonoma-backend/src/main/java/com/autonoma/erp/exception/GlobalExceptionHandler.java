package com.autonoma.erp.exception;

import com.autonoma.erp.service.admin.BackendErrorLoggerService;
import com.autonoma.erp.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.autonoma.erp.util.LogHelper;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Autowired
    private BackendErrorLoggerService backendErrorLoggerService;

    private void logException(Exception ex, WebRequest request, HttpStatus status) {
        try {
            String path = "";
            String method = "";
            if (request instanceof ServletWebRequest) {
                jakarta.servlet.http.HttpServletRequest servletReq = ((ServletWebRequest) request).getRequest();
                path = servletReq.getRequestURI();
                method = servletReq.getMethod();
            } else {
                path = request.getDescription(false);
            }

            String username = SecurityUtils.getCurrentUserId();
            // Trigger asynchronous logging safely
            backendErrorLoggerService.logError(ex, method, path, username, status.value(), null, null);
        } catch (Throwable t) {
            System.err.println("[CRITICAL] GlobalExceptionHandler failed to trigger error log: " + t.getMessage());
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        logException(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error");
        body.put("details", ex.getMessage());
        body.put("path", request.getDescription(false));

        // Log formatted error to console
        Map<String, Object> meta = new HashMap<>();
        meta.put("path", request.getDescription(false));
        meta.put("exceptionType", ex.getClass().getName());
        LogHelper.error(log, "GlobalExceptionHandler", "handleAllExceptions", ex.getMessage(), ex, meta);

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Object> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", java.time.LocalDateTime.now());
        body.put("message", "Method Not Allowed");
        body.put("details", ex.getMessage());
        body.put("path", request.getDescription(false));

        return new ResponseEntity<>(body, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex, WebRequest request) {
        logException(ex, request, HttpStatus.BAD_REQUEST);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        logException(ex, request, HttpStatus.BAD_REQUEST);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Invalid Input Data");
        body.put("details", ex.getMessage());
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Cannot delete or modify this record because it is currently in use by other related modules (Foreign Key Constraint Violation).");
        body.put("details", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getReason() != null ? ex.getReason() : ex.getMessage());
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Malformed JSON request");
        body.put("details", ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
