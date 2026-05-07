package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "audit_schedule_criteria")
@Data
public class AuditScheduleCriteria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_schedule_id")
    @JsonIgnore
    private AuditSchedule auditSchedule;

    private Integer seqNo;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String clause;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String criteriaDetails;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String attachmentReq;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AuditSchedule getAuditSchedule() { return auditSchedule; }
    public void setAuditSchedule(AuditSchedule auditSchedule) { this.auditSchedule = auditSchedule; }
    public Integer getSeqNo() { return seqNo; }
    public void setSeqNo(Integer seqNo) { this.seqNo = seqNo; }
    public String getClause() { return clause; }
    public void setClause(String clause) { this.clause = clause; }
    public String getCriteriaDetails() { return criteriaDetails; }
    public void setCriteriaDetails(String criteriaDetails) { this.criteriaDetails = criteriaDetails; }
    public String getAttachmentReq() { return attachmentReq; }
    public void setAttachmentReq(String attachmentReq) { this.attachmentReq = attachmentReq; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
