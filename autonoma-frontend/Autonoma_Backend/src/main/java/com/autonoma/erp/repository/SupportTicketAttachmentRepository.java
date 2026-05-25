package com.autonoma.erp.repository;

import com.autonoma.erp.model.SupportTicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketAttachmentRepository extends JpaRepository<SupportTicketAttachment, Integer> {
    List<SupportTicketAttachment> findByTicketRowIdOrderByUploadedAtAsc(Integer ticketRowId);
}
