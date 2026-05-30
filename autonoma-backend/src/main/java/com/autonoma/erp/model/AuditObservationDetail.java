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
    @JoinColumn(name = "OBSERVATION_ID")
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

    @Column(name = "NCR_NO", columnDefinition = "NVARCHAR(50)")
    private String ncrNo;

    @Column(name = "SEQ_NO", columnDefinition = "NVARCHAR(50)")
    private String seqNo;

    @Column(name = "CLAUSE", columnDefinition = "NVARCHAR(100)")
    private String clause;

    @Column(name = "CRITERIA_DETAILS", columnDefinition = "NVARCHAR(MAX)")
    private String criteriaDetails;

    @Column(name = "ATTACHMENT_REQ", columnDefinition = "NVARCHAR(10)")
    private String attachmentReq;

    @Column(name = "ATTACHMENT_PATH", length = 1000)
    private String attachmentPath;

    @Column(name = "OBSERVATION_STATUS", columnDefinition = "NVARCHAR(50)")
    private String observationStatus;

    @Column(name = "APPROVAL_STATUS", columnDefinition = "NVARCHAR(50)")
    private String approvalStatus;

    @Column(name = "COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String comments;

    @Column(name = "ROOT_CAUSE", columnDefinition = "NVARCHAR(MAX)")
    private String rootCause;

    @Column(name = "CORRECTIVE_ACTION", columnDefinition = "NVARCHAR(MAX)")
    private String correctiveAction;

    @Column(name = "PREVENTIVE_ACTION", columnDefinition = "NVARCHAR(MAX)")
    private String preventiveAction;

    @Column(name = "TARGET_DATE")
    @Temporal(TemporalType.DATE)
    private java.util.Date targetDate;

    @Column(name = "CLOSED_DATE")
    @Temporal(TemporalType.DATE)
    private java.util.Date closedDate;

    @Column(name = "CLOSED_BY", columnDefinition = "NVARCHAR(255)")
    private String closedBy;

    @Column(name = "NCR_STATUS", columnDefinition = "NVARCHAR(50)")
    private String ncrStatus;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    // Helper method for bi-directional sync
    public void setAuditObservation(AuditObservation observation) {
        this.auditObservation = observation;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
