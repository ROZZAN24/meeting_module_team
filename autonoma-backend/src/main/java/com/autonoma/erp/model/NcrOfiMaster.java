package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "QMS_NCR_OFI_MASTER")
@Data
public class NcrOfiMaster extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "NCR_OFI_NO", unique = true, nullable = false)
    private String ncrOfiNo;

    @Column(name = "OBSERVATION_ID", nullable = false)
    private Integer observationId;

    @Column(name = "OBSERVATION_DETAIL_ID", nullable = false)
    private Integer observationDetailId;

    @Column(name = "TYPE", nullable = false)
    private String type; // NCR or OFI

    @Column(name = "OBSERVATION_DATE", nullable = false)
    private LocalDate observationDate;

    @Column(name = "TARGET_DATE", nullable = false)
    private LocalDate targetDate;

    @Column(name = "NCR_APPROVER_ID")
    private Integer ncrApproverId;

    @Column(name = "AUDITEE_NAME")
    private String auditeeName;

    @Column(name = "NCR_APPROVER_NAME")
    private String ncrApproverName;

    @Column(name = "ROOT_CAUSE")
    private String rootCause;

    @Column(name = "CORRECTIVE_ACTION")
    private String correctiveAction;

    @Column(name = "PREVENTIVE_ACTION")
    private String preventiveAction;

    @Column(name = "STATUS")
    private String status = "OPEN";

    @Column(name = "APPROVAL_STATUS")
    private String approvalStatus = "PENDING";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
