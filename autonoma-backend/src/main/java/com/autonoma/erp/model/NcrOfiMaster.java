package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "QMS_NCR_OFI_MASTER")
@Data
public class NcrOfiMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ncr_ofi_no", unique = true, nullable = false)
    private String ncrOfiNo;

    @Column(name = "observation_id", nullable = false)
    private Integer observationId;

    @Column(name = "observation_detail_id", nullable = false)
    private Integer observationDetailId;

    @Column(nullable = false)
    private String type; // NCR or OFI

    @Column(name = "observation_date", nullable = false)
    private LocalDate observationDate;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "ncr_approver_id")
    private Integer ncrApproverId;

    @Column(name = "auditee_name")
    private String auditeeName;

    @Column(name = "ncr_approver_name")
    private String ncrApproverName;

    @Column(name = "root_cause")
    private String rootCause;

    @Column(name = "corrective_action")
    private String correctiveAction;

    @Column(name = "preventive_action")
    private String preventiveAction;

    @Column
    private String status = "OPEN";

    @Column(name = "approval_status")
    private String approvalStatus = "PENDING";




}
