package com.autonoma.erp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "QMS_AUDIT_TYPE")
public class AuditType extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "AUDIT_TYPE", columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(name = "STANDARD", columnDefinition = "NVARCHAR(255)")
    private String standard;
    
    @Column(name = "DESCRIPTION", columnDefinition = "NVARCHAR(MAX)")
    private String description;
    
    @Column(name = "CRITERIA_MIN_COUNT")
    private Integer criteriaMinCount;

    @Column(name = "CUSTOMER_AUDIT_AREA", columnDefinition = "NVARCHAR(255)")
    private String customerAuditArea;

    @Column(name = "AUDIT_AREA", columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "CRITERIA_TYPE", columnDefinition = "NVARCHAR(100)")
    private String criteriaType;

    @Column(name = "STATUS", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

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
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
