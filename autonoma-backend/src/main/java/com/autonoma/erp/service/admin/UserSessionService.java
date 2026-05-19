package com.autonoma.erp.service.admin;

import com.autonoma.erp.model.admin.UserSession;
import com.autonoma.erp.model.admin.UserSessionActivity;
import com.autonoma.erp.repository.admin.UserSessionActivityRepository;
import com.autonoma.erp.repository.admin.UserSessionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class UserSessionService {

    private static final java.util.Map<String, Long> userLastSeenMap = new ConcurrentHashMap<>();

    @Autowired
    private UserSessionRepository userSessionRepository;

    @Autowired
    private UserSessionActivityRepository userSessionActivityRepository;

    public void updateLastSeen(String userId) {
        if (userId != null) {
            userLastSeenMap.put(userId, System.currentTimeMillis());
        }
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupInactiveSessions() {
        try {
            List<UserSession> allSessions = userSessionRepository.findAll();
            long now = System.currentTimeMillis();
            for (UserSession session : allSessions) {
                if (session != null && "ACTIVE".equals(session.getStatus())) {
                    String userId = session.getUserId();
                    Long lastSeen = userId != null ? userLastSeenMap.get(userId) : null;
                    
                    boolean isInactive = false;
                    long inactiveTimestamp = now;
                    
                    if (lastSeen != null) {
                        if (now - lastSeen > 3 * 60 * 1000) { // 3 minutes threshold
                            isInactive = true;
                            inactiveTimestamp = lastSeen;
                        }
                    } else {
                        // Check if loginTime was more than 10 minutes ago
                        if (session.getLoginTime() != null && (now - session.getLoginTime().getTime() > 10 * 60 * 1000)) {
                            isInactive = true;
                            inactiveTimestamp = session.getLoginTime().getTime();
                        }
                    }
                    
                    if (isInactive) {
                        session.setStatus("COMPLETED");
                        session.setLogoutTime(new Date(inactiveTimestamp));
                        userSessionRepository.save(session);
                        
                        if (userId != null) {
                            recordPageExit(userId);
                            userLastSeenMap.remove(userId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Silently log or handle scheduler errors to keep it from breaking the application
            System.err.println("Error in session cleanup scheduler: " + e.getMessage());
        }
    }

    public UserSession recordLogin(String userId, HttpServletRequest request, String userAgent) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        // Handle comma-separated list of IPs if multiple proxies exist
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        // Deactivate previous active sessions for this user
        List<UserSession> activeSessions = userSessionRepository.findByUserIdAndStatus(userId, "ACTIVE");
        if (activeSessions != null) {
            for (UserSession s : activeSessions) {
                s.setLogoutTime(new Date());
                s.setStatus("COMPLETED");
                userSessionRepository.save(s);
            }
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
        Optional<UserSession> sessionOpt = userSessionRepository.findTopByUserIdAndStatusOrderByLoginTimeDesc(userId,
                "ACTIVE");
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
        Optional<UserSessionActivity> activityOpt = userSessionActivityRepository
                .findTopByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(userId);
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
