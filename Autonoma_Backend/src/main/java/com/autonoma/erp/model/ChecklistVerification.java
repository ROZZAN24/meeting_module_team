package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "QMS_CHECKLIST_VERIFICATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNMENT_ID")
    private ChecklistAssignment assignment;

    @Column(name = "VERIFIED_BY")
    private String verifiedBy;

    @ManyToOne
    @JoinColumn(name = "STATUS_ID")
    private StatusMaster status;

    @Column(name = "REMARKS", columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "VERIFIED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date verifiedDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ChecklistAssignment getAssignment() { return assignment; }
    public void setAssignment(ChecklistAssignment assignment) { this.assignment = assignment; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public StatusMaster getStatus() { return status; }
    public void setStatus(StatusMaster status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Date getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(Date verifiedDate) { this.verifiedDate = verifiedDate; }
}
