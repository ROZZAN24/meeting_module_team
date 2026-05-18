package com.autonoma.erp.controller;

import com.autonoma.erp.model.UserSessionActivity;
import com.autonoma.erp.service.UserSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/sessions")
@CrossOrigin(origins = "*")
public class UserSessionAnalyticsController {

    @Autowired
    private UserSessionService userSessionService;

    @PostMapping("/record-entry")
    public void recordEntry(@RequestBody Map<String, String> data) {
        String userId = data.get("userId");
        String pageName = data.get("pageName");
        String pageUrl = data.get("pageUrl");
        userSessionService.recordPageEntry(userId, pageName, pageUrl);
    }

    @PostMapping("/record-exit")
    public void recordExit(@RequestBody Map<String, String> data) {
        String userId = data.get("userId");
        userSessionService.recordPageExit(userId);
    }

    @GetMapping("/navigation")
    public List<UserSessionActivity> getAllNavigation() {
        return userSessionService.getAllNavigation();
    }

    @GetMapping("/navigation/{userId}")
    public List<UserSessionActivity> getUserNavigation(@PathVariable String userId) {
        return userSessionService.getUserNavigation(userId);
    }

    @GetMapping("/check-status/{userId}")
    public boolean checkSessionStatus(@PathVariable String userId) {
        return userSessionService.isSessionValid(userId);
    }

    @PostMapping("/terminate")
    public void terminateSession(@RequestBody Map<String, String> data) {
        String userId = data.get("userId");
        userSessionService.terminateSession(userId);
    }
}
