package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_MOM_DETAIL")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class QmsMomDetail extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MOM_ID", nullable = false)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private QmsMomMaster mom;

    @Column(name = "DISCUSSED_POINT", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String discussedPoint;

    @JsonProperty("type")
    @Column(name = "POINT_TYPE")
    private String pointType;

    @Column(name = "MATERIAL_LIST", columnDefinition = "NVARCHAR(MAX)")
    private String materialList;

    @Column(name = "PROCESS_TYPE")
    private String processType; // INFO / ACTION

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ASSIGNED_BY_ID")
    private EmployeeMaster assignedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ASSIGNED_TO_ID")
    private EmployeeMaster assignedTo;

    @Column(name = "TARGET_DATE")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;

    @Column(name = "REVIEW_DATE")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reviewDate;

    @Column(name = "ATTACHMENT_REQUIRED")
    private String attachmentRequired = "NO";

    @Column(name = "STATUS")
    private String status = "OPEN";

    @Column(name = "ACTION_TAKEN", columnDefinition = "NVARCHAR(MAX)")
    private String actionTaken;

    @Column(name = "ACTION_OBSERVATION", columnDefinition = "NVARCHAR(MAX)")
    private String actionObservation;

    @Column(name = "CANCEL_REMARKS", columnDefinition = "NVARCHAR(MAX)")
    private String cancelRemarks;

    @Column(name = "REV_NO")
    private Integer revNo = 0;

    @Column(name = "AMENDMENT_COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String amendmentComments;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
