package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "QMS_AUDIT_SCHEDULE")
@Getter
@Setter
public class AuditSchedule extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_no", columnDefinition = "NVARCHAR(255)")
    private String scheduleNo;
    
    @Column(name = "schedule_date")
    @Temporal(TemporalType.DATE)
    private Date scheduleDate;
    
    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "audit_type", columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(name = "item_code", columnDefinition = "NVARCHAR(255)")
    private String itemCode;

    @Column(name = "audit_area", columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "criteria_min_count")
    private Integer criteriaMinCount;
    
    @Column(name = "audit_date")
    @Temporal(TemporalType.DATE)
    private Date auditDate;
    
    @Column(name = "audit_month", columnDefinition = "NVARCHAR(50)")
    private String auditMonth;

    @Column(name = "start_time", columnDefinition = "NVARCHAR(50)")
    private String startTime;

    @Column(name = "end_time", columnDefinition = "NVARCHAR(50)")
    private String endTime;

    @Column(name = "department", columnDefinition = "NVARCHAR(255)")
    private String department;
    
    @Column(name = "auditee", columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(name = "auditee_type", columnDefinition = "NVARCHAR(255)")
    private String auditeeType;

    @Column(name = "auditee_details", columnDefinition = "NVARCHAR(MAX)")
    private String auditeeDetails;

    @Column(name = "auditor", columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(name = "auditor_type", columnDefinition = "NVARCHAR(255)")
    private String auditorType;

    @Column(name = "auditor_details", columnDefinition = "NVARCHAR(MAX)")
    private String auditorDetails;

    @Column(name = "ncr_approved_by", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(name = "ncr_approved_by_type", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedByType;

    @Column(name = "ncr_approved_by_details", columnDefinition = "NVARCHAR(MAX)")
    private String ncrApprovedByDetails;

    
    
    

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
    public String getAuditeeDetails() { return auditeeDetails; }
    public void setAuditeeDetails(String auditeeDetails) { this.auditeeDetails = auditeeDetails; }
    public String getAuditor() { return auditor; }
    public void setAuditor(String auditor) { this.auditor = auditor; }
    public String getAuditorType() { return auditorType; }
    public void setAuditorType(String auditorType) { this.auditorType = auditorType; }
    public String getAuditorDetails() { return auditorDetails; }
    public void setAuditorDetails(String auditorDetails) { this.auditorDetails = auditorDetails; }
    public String getNcrApprovedBy() { return ncrApprovedBy; }
    public void setNcrApprovedBy(String ncrApprovedBy) { this.ncrApprovedBy = ncrApprovedBy; }
    public String getNcrApprovedByType() { return ncrApprovedByType; }
    public void setNcrApprovedByType(String ncrApprovedByType) { this.ncrApprovedByType = ncrApprovedByType; }
    public String getNcrApprovedByDetails() { return ncrApprovedByDetails; }
    public void setNcrApprovedByDetails(String ncrApprovedByDetails) { this.ncrApprovedByDetails = ncrApprovedByDetails; }
    public void setCriteriaList(List<AuditScheduleCriteria> criteriaList) { this.criteriaList = criteriaList; }
}
