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

@ControllerAdvice
public class GlobalExceptionHandler {

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
        body.put("message", "Internal Server Error");
        body.put("details", ex.getMessage());
        body.put("path", request.getDescription(false));

        // Log the stack trace for developers (this will show in console)
        ex.printStackTrace();

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
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
}
