package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "audit_schedules")
@Getter
@Setter
public class AuditSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String scheduleNo;
    
    @Temporal(TemporalType.DATE)
    private Date scheduleDate;
    
    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String itemCode;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "isDeleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "criteriaMinCount")
    private Integer criteriaMinCount;
    
    @Temporal(TemporalType.DATE)
    private Date auditDate;
    
    @Column(columnDefinition = "NVARCHAR(50)")
    private String auditMonth;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String startTime;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String endTime;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String department;
    
    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditeeType;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String auditorType;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedByType;

    private String createdBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();
    
    private String updatedBy;
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @OneToMany(mappedBy = "auditSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditScheduleCriteria> criteriaList = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getScheduleNo() { return scheduleNo; }
    public void setScheduleNo(String scheduleNo) { this.scheduleNo = scheduleNo; }
    public Date getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(Date scheduleDate) { this.scheduleDate = scheduleDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAuditType() { return auditType; }
    public void setAuditType(String auditType) { this.auditType = auditType; }
    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }
    public String getAuditArea() { return auditArea; }
    public void setAuditArea(String auditArea) { this.auditArea = auditArea; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Integer getCriteriaMinCount() { return criteriaMinCount; }
    public void setCriteriaMinCount(Integer criteriaMinCount) { this.criteriaMinCount = criteriaMinCount; }
    public Date getAuditDate() { return auditDate; }
    public void setAuditDate(Date auditDate) { this.auditDate = auditDate; }
    public String getAuditMonth() { return auditMonth; }
    public void setAuditMonth(String auditMonth) { this.auditMonth = auditMonth; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAuditee() { return auditee; }
    public void setAuditee(String auditee) { this.auditee = auditee; }
    public String getAuditeeType() { return auditeeType; }
    public void setAuditeeType(String auditeeType) { this.auditeeType = auditeeType; }
    public String getAuditor() { return auditor; }
    public void setAuditor(String auditor) { this.auditor = auditor; }
    public String getAuditorType() { return auditorType; }
    public void setAuditorType(String auditorType) { this.auditorType = auditorType; }
    public String getNcrApprovedBy() { return ncrApprovedBy; }
    public void setNcrApprovedBy(String ncrApprovedBy) { this.ncrApprovedBy = ncrApprovedBy; }
    public String getNcrApprovedByType() { return ncrApprovedByType; }
    public void setNcrApprovedByType(String ncrApprovedByType) { this.ncrApprovedByType = ncrApprovedByType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Date getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(Date updatedDate) { this.updatedDate = updatedDate; }
    public List<AuditScheduleCriteria> getCriteriaList() { return criteriaList; }
    public void setCriteriaList(List<AuditScheduleCriteria> criteriaList) { this.criteriaList = criteriaList; }

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
