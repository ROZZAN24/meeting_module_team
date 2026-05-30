package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "QMS_NCR_OFI_APPROVAL")
@Data
public class NcrOfiApproval extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "NCR_OFI_ID", nullable = false)
    private Integer ncrOfiId;

    @Column(name = "APPROVER_ID", nullable = false)
    private Integer approverId;

    @Column(name = "APPROVAL_ROLE")
    private String approvalRole; // DEPT_HEAD, QMS_REVIEWER, FINAL_APPROVER

    @Column(name = "STATUS")
    private String status; // APPROVED, REJECTED, REWORK

    @Column(name = "COMMENTS")
    private String comments;

    @Column(name = "APPROVAL_DATE")
    private LocalDateTime approvalDate = LocalDateTime.now();

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
