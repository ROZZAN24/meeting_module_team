package com.autonoma.erp.controller;

import com.autonoma.erp.model.AppNotification;
import com.autonoma.erp.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppNotificationController {

    private final AppNotificationRepository repository;

    @GetMapping("/unread/{empId}")
    public List<AppNotification> getUnreadNotifications(@PathVariable Long empId) {
        return repository.findByRecipientEmpIdAndIsReadFalseOrderByCreatedAtDesc(empId);
    }

    @GetMapping("/all/{empId}")
    public List<AppNotification> getAllNotifications(@PathVariable Long empId) {
        return repository.findByRecipientEmpIdOrderByCreatedAtDesc(empId);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<AppNotification> markAsRead(@PathVariable Long id) {
        return repository.findById(id).map(notif -> {
            notif.setIsRead(true);
            return ResponseEntity.ok(repository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all/{empId}")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long empId) {
        List<AppNotification> unread = repository.findByRecipientEmpIdAndIsReadFalseOrderByCreatedAtDesc(empId);
        unread.forEach(n -> n.setIsRead(true));
        repository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
