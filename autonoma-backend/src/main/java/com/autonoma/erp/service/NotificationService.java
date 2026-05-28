package com.autonoma.erp.service;

import com.autonoma.erp.model.AppNotification;
import com.autonoma.erp.model.EmployeeMaster;
import com.autonoma.erp.model.QmsMeetingSchedule;
import com.autonoma.erp.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final AppNotificationRepository notificationRepository;

    public void sendMeetingNotification(String recipientName, String recipientEmail, String subject, String message) {
        log.info("Sending Meeting Notification to: {} <{}>", recipientName, recipientEmail);
        log.info("Subject: {}", subject);
        log.info("Message: {}", message);
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
            }
        }
    }

    public void notifyUserAboutMeeting(EmployeeMaster recipient, QmsMeetingSchedule schedule, String actionType) {
        if (recipient == null || recipient.getId() == null) return;

        AppNotification notification = new AppNotification();
        notification.setRecipientEmpId(recipient.getId());
        
        String meetingName = schedule.getMeetingName() != null ? schedule.getMeetingName() : schedule.getSubject();
        if (meetingName == null) meetingName = "Meeting";

        if ("NEW".equalsIgnoreCase(actionType)) {
            notification.setTitle("New Meeting Assigned: " + schedule.getScheduleNo());
            notification.setMessage(String.format("You have been assigned to %s on %s at %s.", 
                meetingName, schedule.getMeetingDate(), schedule.getStartTime()));
        } else if ("UPDATE_TIME".equalsIgnoreCase(actionType)) {
            notification.setTitle("Meeting Rescheduled: " + schedule.getScheduleNo());
            notification.setMessage(String.format("%s is now scheduled for %s at %s.", 
                meetingName, schedule.getMeetingDate(), schedule.getStartTime()));
        }

        notification.setLinkUrl("/qms/meeting-schedule/edit/" + schedule.getId());
        notificationRepository.save(notification);

        // Also trigger the existing email log logic
        sendMeetingNotification(recipient.getEmployeeName(), recipient.getOfficeMail(), notification.getTitle(), notification.getMessage());
    }
}
