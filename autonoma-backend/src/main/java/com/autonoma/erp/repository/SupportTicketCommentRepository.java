package com.autonoma.erp.repository;

import com.autonoma.erp.model.SupportTicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketCommentRepository extends JpaRepository<SupportTicketComment, Integer> {
    List<SupportTicketComment> findByTicketRowIdOrderByCreatedAtAsc(Integer ticketRowId);
}
