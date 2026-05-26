package com.autonoma.erp.repository;

import com.autonoma.erp.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByRecipientEmpIdAndIsReadFalseOrderByCreatedAtDesc(Long recipientEmpId);
    List<AppNotification> findByRecipientEmpIdOrderByCreatedAtDesc(Long recipientEmpId);
}
