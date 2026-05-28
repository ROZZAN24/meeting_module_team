package com.autonoma.erp.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "QMS_AUDIT_CRITERIA")
public class AuditCriteria extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seq_no", columnDefinition = "NVARCHAR(50)")
    private String seqNo;

    @Column(name = "audit_type", columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(name = "clause", columnDefinition = "NVARCHAR(255)")
    private String clause;
    
    @Column(name = "criteria_text", columnDefinition = "NVARCHAR(MAX)")
    private String criteriaText;
    
    @Column(name = "department", columnDefinition = "NVARCHAR(255)")
    private String department;

    @Column(name = "attachment_required", columnDefinition = "NVARCHAR(20)")
    private String attachmentRequired; // YES/NO

    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "attachment_info", columnDefinition = "NVARCHAR(MAX)")
    private String attachmentInfo; // JSON string of file metadata

    @Column(name = "level", columnDefinition = "NVARCHAR(100)")
    private String level; // L1,L2...


    


    // Explicit Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSeqNo() { return seqNo; }
    public void setSeqNo(String seqNo) { this.seqNo = seqNo; }
    public String getAuditType() { return auditType; }
    public void setAuditType(String auditType) { this.auditType = auditType; }
    public String getClause() { return clause; }
    public void setClause(String clause) { this.clause = clause; }
    public String getCriteriaText() { return criteriaText; }
    public void setCriteriaText(String criteriaText) { this.criteriaText = criteriaText; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAttachmentRequired() { return attachmentRequired; }
    public void setAttachmentRequired(String attachmentRequired) { this.attachmentRequired = attachmentRequired; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAttachmentInfo() { return attachmentInfo; }
    public void setAttachmentInfo(String attachmentInfo) { this.attachmentInfo = attachmentInfo; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
