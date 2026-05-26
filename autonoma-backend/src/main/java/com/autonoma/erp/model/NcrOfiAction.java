package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "QMS_NCR_OFI_ACTION")
@Data
public class NcrOfiAction extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ncr_ofi_id", nullable = false)
    private Integer ncrOfiId;

    @Column(name = "action_type")
    private String actionType; // CORRECTIVE, PREVENTIVE, ROOT_CAUSE

    @Column(name = "action_description")
    private String actionDescription;

    @Column(name = "action_by")
    private Integer actionBy;

    @Column(name = "action_date")
    private LocalDate actionDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    private String remarks;
    private String status;

}
