package com.autonoma.erp.exception;

import com.autonoma.erp.service.admin.BackendErrorLoggerService;
import com.autonoma.erp.util.SecurityUtils;
import com.autonoma.erp.util.LogContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
            // Trigger asynchronous logging safely to DB
            backendErrorLoggerService.logError(ex, method, path, username, status.value(), null, null);
        } catch (Throwable t) {
            System.err.println("[CRITICAL] GlobalExceptionHandler failed to trigger error log to DB: " + t.getMessage());
        }
    }

    private Map<String, Object> createErrorBody(String userFriendlyMessage, WebRequest request, String transactionId) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", userFriendlyMessage);
        body.put("transactionId", transactionId);
        if (request instanceof ServletWebRequest) {
            body.put("path", ((ServletWebRequest) request).getRequest().getRequestURI());
        } else {
            body.put("path", request.getDescription(false));
        }
        return body;
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public Object handleNoResourceFoundException(org.springframework.web.servlet.resource.NoResourceFoundException ex, WebRequest request) {
        String path = "";
        if (request instanceof ServletWebRequest) {
            jakarta.servlet.http.HttpServletRequest servletReq = ((ServletWebRequest) request).getRequest();
            path = servletReq.getRequestURI();
        } else {
            path = request.getDescription(false);
        }

        if (path != null && !path.startsWith("/api/")) {
            return new org.springframework.web.servlet.ModelAndView("forward:/index.html");
        }

        log.warn("Resource not found: {} - Message: {}", path, ex.getMessage());
        Map<String, Object> body = createErrorBody("Resource not found", request, LogContextHolder.getTransactionId());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.error("Internal Server Error occurred. TX: {} | Reason: {}", txId, ex.getMessage(), ex);
        logException(ex, request, HttpStatus.INTERNAL_SERVER_ERROR);

        Map<String, Object> body = createErrorBody("An internal server error occurred. Please contact the administrator.", request, txId);
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Object> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.warn("HTTP Method not supported. TX: {} | Reason: {}", txId, ex.getMessage());
        Map<String, Object> body = createErrorBody("HTTP method not allowed for this endpoint.", request, txId);
        return new ResponseEntity<>(body, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.error("Runtime exception encountered. TX: {} | Reason: {}", txId, ex.getMessage(), ex);
        logException(ex, request, HttpStatus.BAD_REQUEST);

        Map<String, Object> body = createErrorBody("Failed to process request due to a server runtime issue.", request, txId);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.warn("Illegal argument exception. TX: {} | Reason: {}", txId, ex.getMessage());
        logException(ex, request, HttpStatus.BAD_REQUEST);

        Map<String, Object> body = createErrorBody(ex.getMessage() != null ? ex.getMessage() : "Invalid argument passed in request.", request, txId);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.error("Data integrity violation. TX: {} | Reason: {}", txId, ex.getMessage(), ex);
        logException(ex, request, HttpStatus.CONFLICT);

        Map<String, Object> body = createErrorBody("Database integrity constraint violation (e.g. key duplication, null fields, check constraints).", request, txId);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.warn("Response status exception. TX: {} | Status: {} | Reason: {}", txId, ex.getStatusCode(), ex.getReason());
        Map<String, Object> body = createErrorBody(ex.getReason() != null ? ex.getReason() : "Request processing failed.", request, txId);
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex, WebRequest request) {
        String txId = LogContextHolder.getTransactionId();
        log.warn("Malformed HTTP request payload. TX: {} | Reason: {}", txId, ex.getMessage());
        Map<String, Object> body = createErrorBody("Malformed JSON or request payload format.", request, txId);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.transaction.TransactionSystemException.class)
    public ResponseEntity<Object> handleTransactionSystem(org.springframework.transaction.TransactionSystemException ex, WebRequest request) {
        logException(ex, request, HttpStatus.BAD_REQUEST);

        Throwable cause = ex.getRootCause();
        String message = "Transaction commit failed: ";
        
        if (cause instanceof jakarta.validation.ConstraintViolationException) {
            jakarta.validation.ConstraintViolationException cve = (jakarta.validation.ConstraintViolationException) cause;
            String violations = cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(java.util.stream.Collectors.joining(", "));
            message += "Validation failed: " + violations;
        } else if (cause != null) {
            message += cause.getMessage();
        } else {
            message += ex.getMessage();
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", message);
        body.put("details", ex.getMessage());
        body.put("path", request.getDescription(false));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.orm.jpa.JpaSystemException.class)
    public ResponseEntity<Object> handleJpaSystem(org.springframework.orm.jpa.JpaSystemException ex, WebRequest request) {
        logException(ex, request, HttpStatus.BAD_REQUEST);
        
        Throwable cause = ex.getRootCause();
        String message = "JPA system error: " + (cause != null ? cause.getMessage() : ex.getMessage());
        
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", message);
        body.put("details", ex.getMessage());
        body.put("path", request.getDescription(false));
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
