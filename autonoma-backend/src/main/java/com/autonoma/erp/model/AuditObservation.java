package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "QMS_AUDIT_OBSERVATION")
@Data
public class AuditObservation extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "OBSERVATION_NO", columnDefinition = "NVARCHAR(50)")
    private String observationNo;

    @Column(name = "OBSERVATION_DATE")
    @Temporal(TemporalType.DATE)
    private Date observationDate;

    @Column(name = "AUDIT_SCHEDULE_NO", columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(name = "AUDIT_TYPE", columnDefinition = "NVARCHAR(100)")
    private String auditType;

    @Column(name = "AUDIT_AREA", columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "DEPARTMENT_NAME", columnDefinition = "NVARCHAR(255)")
    private String departmentName;

    @Column(name = "AUDITEE", columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(name = "AUDITOR", columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(name = "NCR_APPROVED_BY", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(name = "STATUS", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "AUDIT_SCORE")
    private Integer auditScore = 0;
    
    @Column(name = "OFI_COUNT")
    private Integer ofiCount = 0;
    
    @Column(name = "COMPLIANCE_COUNT")
    private Integer complianceCount = 0;
    
    @Column(name = "NCR_COUNT")
    private Integer ncrCount = 0;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "auditObservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<AuditObservationDetail> details = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonProperty("auditType")
    public String getAuditType() {
        return auditType;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("auditArea")
    public String getAuditArea() {
        return auditArea;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("departmentName")
    public String getDepartmentName() {
        return departmentName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
