package com.autonoma.erp.service;

import com.autonoma.erp.model.UserSession;
import com.autonoma.erp.model.UserSessionActivity;
import com.autonoma.erp.repository.UserSessionRepository;
import com.autonoma.erp.repository.UserSessionActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserSessionService {

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private UserSessionActivityRepository userSessionActivityRepository;

    public UserSession recordLogin(String userId, HttpServletRequest request, String userAgent) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        // Handle comma-separated list of IPs if multiple proxies exist
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setLoginTime(new Date());
        session.setStatus("ACTIVE");
        return userSessionRepository.save(session);
    }

    public void recordLogout(String userId) {
        Optional<UserSession> sessionOpt = userSessionRepository.findTopByUserIdAndStatusOrderByLoginTimeDesc(userId, "ACTIVE");
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setLogoutTime(new Date());
            session.setStatus("COMPLETED");
            userSessionRepository.save(session);
        }
        recordPageExit(userId);
    }

    public void recordPageEntry(String userId, String pageName, String pageUrl) {
        // First exit any existing page
        recordPageExit(userId);

        UserSessionActivity activity = UserSessionActivity.builder()
                .userId(userId)
                .pageName(pageName)
                .pageUrl(pageUrl)
                .entryTime(new Date())
                .isIdle(false)
                .idleTimeMs(0L)
                .build();
        userSessionActivityRepository.save(activity);
    }

    public void recordPageExit(String userId) {
        Optional<UserSessionActivity> activityOpt = userSessionActivityRepository.findTopByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(userId);
        if (activityOpt.isPresent()) {
            UserSessionActivity activity = activityOpt.get();
            Date now = new Date();
            activity.setExitTime(now);
            activity.setDurationMs(now.getTime() - activity.getEntryTime().getTime());
            userSessionActivityRepository.save(activity);
        }
    }

    public List<UserSessionActivity> getAllNavigation() {
        return userSessionActivityRepository.findAll();
    }

    public List<UserSessionActivity> getUserNavigation(String userId) {
        return userSessionActivityRepository.findAllByUserIdOrderByEntryTimeDesc(userId);
    }

    public boolean isSessionValid(String userId) {
        return userSessionRepository.findTopByUserIdAndStatusOrderByLoginTimeDesc(userId, "ACTIVE").isPresent();
    }

    public void terminateSession(String userId) {
        recordLogout(userId);
    }

    public List<UserSession> getAllSessions() {
        return userSessionRepository.findAll();
    }
}
