package com.autonoma.erp.service;

import com.autonoma.erp.model.UserSession;
import com.autonoma.erp.model.UserSessionActivity;
import com.autonoma.erp.repository.UserSessionRepository;
import com.autonoma.erp.repository.UserSessionActivityRepository;
import com.autonoma.erp.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    public UserSession recordLogin(String userId, HttpServletRequest request, String userAgent) {
        // Mark previous active sessions for this user as EXPIRED (Ghost sessions)
        List<UserSession> activeSessions = userSessionRepository.findAllByUserIdAndStatus(userId, "ACTIVE");
        if (!activeSessions.isEmpty()) {
            activeSessions.forEach(s -> {
                s.setStatus("EXPIRED");
                s.setLogoutTime(new Date());
                userSessionRepository.save(s);
            });
        }

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
    }

    public List<UserSession> getAllSessions() {
        List<UserSession> list = userSessionRepository.findAll();
        list.forEach(s -> {
            userRepository.findByUserId(s.getUserId()).ifPresent(u -> s.setUserImage(u.getImgName()));
        });
        return list;
    }

    public void recordPageEntry(String userId, String pageName, String pageUrl) {
        // First, close any existing open page session for this user
        recordPageExit(userId);

        UserSessionActivity activity = new UserSessionActivity();
        activity.setUserId(userId);
        activity.setPageName(pageName);
        activity.setPageUrl(pageUrl);
        activity.setEntryTime(new Date());
        userSessionActivityRepository.save(activity);
    }

    public void recordPageExit(String userId) {
        Optional<UserSessionActivity> activeActivity = userSessionActivityRepository.findTopByUserIdAndExitTimeIsNullOrderByEntryTimeDesc(userId);
        if (activeActivity.isPresent()) {
            UserSessionActivity activity = activeActivity.get();
            Date exitTime = new Date();
            activity.setExitTime(exitTime);
            long duration = exitTime.getTime() - activity.getEntryTime().getTime();
            activity.setDurationMs(duration);
            userSessionActivityRepository.save(activity);
        }
    }

    public List<UserSessionActivity> getUserNavigation(String userId) {
        List<UserSessionActivity> list = userSessionActivityRepository.findAllByUserIdOrderByEntryTimeDesc(userId);
        list.forEach(a -> {
            userRepository.findByUserId(a.getUserId()).ifPresent(u -> a.setUserImage(u.getImgName()));
        });
        return list;
    }

    public List<UserSessionActivity> getAllNavigation() {
        List<UserSessionActivity> list = userSessionActivityRepository.findAll();
        list.forEach(a -> {
            userRepository.findByUserId(a.getUserId()).ifPresent(u -> a.setUserImage(u.getImgName()));
        });
        return list;
    }

    public void terminateSession(String userId) {
        Optional<UserSession> sessionOpt = userSessionRepository.findTopByUserIdAndStatusOrderByLoginTimeDesc(userId, "ACTIVE");
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            session.setLogoutTime(new Date());
            session.setStatus("TERMINATED");
            userSessionRepository.save(session);
        }
    }

    public boolean isSessionValid(String userId) {
        Optional<UserSession> sessionOpt = userSessionRepository.findTopByUserIdAndStatusOrderByLoginTimeDesc(userId, "ACTIVE");
        return sessionOpt.isPresent();
    }
}
