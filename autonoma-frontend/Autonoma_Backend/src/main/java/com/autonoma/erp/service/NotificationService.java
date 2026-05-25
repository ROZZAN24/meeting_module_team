package com.autonoma.erp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
public class NotificationService {

    /**
     * Sends a notification to a list of employees.
     * In a production environment, this would integrate with an Email or Push Notification service.
     */
    public void sendMeetingNotification(String recipientName, String recipientEmail, String subject, String message) {
        log.info("Sending Meeting Notification to: {} <{}>", recipientName, recipientEmail);
        log.info("Subject: {}", subject);
        log.info("Message: {}", message);
        // TODO: Integrate with JavaMailSender or SMS Gateway
    }

    public void notifyParticipants(String scheduleNo, String meetingName, String date, String time, List<String> participantEmails) {
        String subject = "New Meeting Scheduled: " + scheduleNo;
        String message = String.format(
            "Hello,\n\nYou have been assigned to a new meeting.\n\nMeeting: %s\nDate: %s\nTime: %s\nSchedule No: %s\n\nPlease ensure your attendance.",
            meetingName, date, time, scheduleNo
        );

        for (String email : participantEmails) {
            if (email != null && !email.isEmpty()) {
                log.info("Notifying participant: {} - {}", email, subject);
                // Real implementation would call JavaMailSender here
            }
        }
    }
}
