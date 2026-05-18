package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ncr_ofi_approval")
@Data
public class NcrOfiApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ncr_ofi_id", nullable = false)
    private Integer ncrOfiId;

    @Column(name = "approver_id", nullable = false)
    private Integer approverId;

    @Column(name = "approval_role")
    private String approvalRole; // DEPT_HEAD, QMS_REVIEWER, FINAL_APPROVER

    private String status; // APPROVED, REJECTED, REWORK
    private String comments;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate = LocalDateTime.now();
}
