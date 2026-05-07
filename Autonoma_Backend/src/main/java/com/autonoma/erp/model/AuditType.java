package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "audit_types")
public class AuditType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String standard;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
    
    private Integer criteriaMinCount;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String customerAuditArea;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String criteriaType;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    private String createdBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();
    
    private String updatedBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    // Explicit Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAuditType() { return auditType; }
    public void setAuditType(String auditType) { this.auditType = auditType; }
    public String getStandard() { return standard; }
    public void setStandard(String standard) { this.standard = standard; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getCriteriaMinCount() { return criteriaMinCount; }
    public void setCriteriaMinCount(Integer criteriaMinCount) { this.criteriaMinCount = criteriaMinCount; }
    public String getCustomerAuditArea() { return customerAuditArea; }
    public void setCustomerAuditArea(String customerAuditArea) { this.customerAuditArea = customerAuditArea; }
    public String getAuditArea() { return auditArea; }
    public void setAuditArea(String auditArea) { this.auditArea = auditArea; }
    public String getCriteriaType() { return criteriaType; }
    public void setCriteriaType(String criteriaType) { this.criteriaType = criteriaType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Date getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(Date updatedDate) { this.updatedDate = updatedDate; }

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
