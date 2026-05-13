package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "qms_checklist_verification")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private ChecklistAssignment assignment;

    @Column(name = "verified_by")
    private String verifiedBy;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private StatusMaster status;

    @Column(name = "remarks", columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "verified_date")
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
