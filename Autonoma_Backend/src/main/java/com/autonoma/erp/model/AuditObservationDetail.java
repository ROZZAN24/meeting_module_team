package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "audit_observation_details")
@Data
public class AuditObservationDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observation_id")
    @JsonIgnore
    private AuditObservation auditObservation;

    private Integer seqNo;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String clause;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String criteriaDetails;

    @Column(columnDefinition = "NVARCHAR(10)")
    private String attachmentReq;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String observationStatus;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String approvalStatus;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String rootCause;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String correctiveAction;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String preventiveAction;

    @Temporal(TemporalType.DATE)
    private java.util.Date targetDate;

    @Temporal(TemporalType.DATE)
    private java.util.Date closedDate;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String closedBy;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String ncrStatus;

    // Helper method for bi-directional sync
    public void setAuditObservation(AuditObservation observation) {
        this.auditObservation = observation;
    }
}
