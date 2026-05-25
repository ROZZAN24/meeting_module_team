package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "ticket_reopen_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketReopenHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ticket_row_id", nullable = false)
    private Integer ticketRowId;

    @Column(name = "reopened_by", nullable = false, length = 100)
    private String reopenedBy;

    @Column(name = "reopened_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date reopenedAt;

    @Column(name = "reason", columnDefinition = "NVARCHAR(MAX)")
    private String reason;

    @Column(name = "expected_duration", length = 100)
    private String expectedDuration;

    @Column(name = "reopen_target_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date reopenTargetDate;

    @PrePersist
    protected void onCreate() {
        this.reopenedAt = new Date();
    }
}
