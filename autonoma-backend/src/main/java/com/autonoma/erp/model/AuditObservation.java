package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "audit_observation")
@Data
public class AuditObservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "observation_no", columnDefinition = "NVARCHAR(50)")
    private String observationNo;

    @Column(name = "observation_date")
    @Temporal(TemporalType.DATE)
    private Date observationDate;

    @Column(name = "audit_schedule_no", columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(name = "audit_type", columnDefinition = "NVARCHAR(100)")
    private String auditType;

    @Column(name = "audit_area", columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "department_name", columnDefinition = "NVARCHAR(255)")
    private String departmentName;

    @Column(name = "auditee", columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(name = "auditor", columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(name = "ncr_approved_by", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "audit_score")
    private Integer auditScore = 0;
    
    @Column(name = "ofi_count")
    private Integer ofiCount = 0;
    
    @Column(name = "compliance_count")
    private Integer complianceCount = 0;
    
    @Column(name = "ncr_count")
    private Integer ncrCount = 0;

    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @OneToMany(mappedBy = "auditObservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<AuditObservationDetail> details = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }

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
}
