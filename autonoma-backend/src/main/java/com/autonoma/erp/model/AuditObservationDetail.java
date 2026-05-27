package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "QMS_AUDIT_OBSERVATION_DETAIL")
@Data
public class AuditObservationDetail extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observation_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private AuditObservation auditObservation;

    @com.fasterxml.jackson.annotation.JsonProperty("observationNo")
    public String getObservationNo() {
        return auditObservation != null ? auditObservation.getObservationNo() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditScheduleNo")
    public String getAuditScheduleNo() {
        return auditObservation != null ? auditObservation.getAuditScheduleNo() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("observationDate")
    public java.util.Date getObservationDate() {
        return auditObservation != null ? auditObservation.getObservationDate() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditType")
    public String getAuditType() {
        return auditObservation != null ? auditObservation.getAuditType() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditArea")
    public String getAuditArea() {
        return auditObservation != null ? auditObservation.getAuditArea() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditor")
    public String getAuditor() {
        return auditObservation != null ? auditObservation.getAuditor() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditee")
    public String getAuditee() {
        return auditObservation != null ? auditObservation.getAuditee() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ncrApprovedBy")
    public String getNcrApprovedBy() {
        return auditObservation != null ? auditObservation.getNcrApprovedBy() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("departmentName")
    public String getDepartmentName() {
        return auditObservation != null ? auditObservation.getDepartmentName() : null;
    }

    @Column(name = "ncr_no", columnDefinition = "NVARCHAR(50)")
    private String ncrNo;

    @Column(name = "seq_no", columnDefinition = "NVARCHAR(50)")
    private String seqNo;

    @Column(name = "clause", columnDefinition = "NVARCHAR(100)")
    private String clause;

    @Column(name = "criteria_details", columnDefinition = "NVARCHAR(MAX)")
    private String criteriaDetails;

    @Column(name = "attachment_req", columnDefinition = "NVARCHAR(10)")
    private String attachmentReq;

    @Column(name = "attachment_path", columnDefinition = "NVARCHAR(MAX)")
    private String attachmentPath;

    @Column(name = "observation_status", columnDefinition = "NVARCHAR(50)")
    private String observationStatus;

    @Column(name = "approval_status", columnDefinition = "NVARCHAR(50)")
    private String approvalStatus;

    @Column(name = "comments", columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(name = "root_cause", columnDefinition = "NVARCHAR(MAX)")
    private String rootCause;

    @Column(name = "corrective_action", columnDefinition = "NVARCHAR(MAX)")
    private String correctiveAction;

    @Column(name = "preventive_action", columnDefinition = "NVARCHAR(MAX)")
    private String preventiveAction;

    @Column(name = "target_date")
    @Temporal(TemporalType.DATE)
    private java.util.Date targetDate;

    @Column(name = "closed_date")
    @Temporal(TemporalType.DATE)
    private java.util.Date closedDate;

    @Column(name = "closed_by", columnDefinition = "NVARCHAR(255)")
    private String closedBy;

    @Column(name = "ncr_status", columnDefinition = "NVARCHAR(50)")
    private String ncrStatus;

    // Helper method for bi-directional sync
    public void setAuditObservation(AuditObservation observation) {
        this.auditObservation = observation;
    }
}
