package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "audit_observations")
@Data
public class AuditObservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String observationNo;

    @Temporal(TemporalType.DATE)
    private Date observationDate;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String auditScheduleNo;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String auditType;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String departmentName;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    private Integer auditScore = 0;
    private Integer ofiCount = 0;
    private Integer complianceCount = 0;
    private Integer ncrCount = 0;

    private String createdBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    private String updatedBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @OneToMany(mappedBy = "auditObservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditObservationDetail> details = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
