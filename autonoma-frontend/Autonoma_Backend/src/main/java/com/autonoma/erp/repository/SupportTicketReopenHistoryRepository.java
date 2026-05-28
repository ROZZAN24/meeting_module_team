package com.autonoma.erp.repository;

import com.autonoma.erp.model.SupportTicketReopenHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketReopenHistoryRepository extends JpaRepository<SupportTicketReopenHistory, Integer> {
    List<SupportTicketReopenHistory> findByTicketRowIdOrderByReopenedAtAsc(Integer ticketRowId);
}
