package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserSession;
import com.autonoma.erp.service.UserSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/audit/sessions")
public class UserSessionController {

    @Autowired
    private UserSessionService userSessionService;

    @GetMapping
    public ResponseEntity<List<UserSession>> getAllSessions() {
        return ResponseEntity.ok(userSessionService.getAllSessions());
    }
}
