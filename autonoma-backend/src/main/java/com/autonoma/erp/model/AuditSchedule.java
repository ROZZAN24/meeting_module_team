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

    @Column(name = "SCHEDULE_NO", columnDefinition = "NVARCHAR(255)")
    private String scheduleNo;
    
    @Column(name = "SCHEDULE_DATE")
    @Temporal(TemporalType.DATE)
    private Date scheduleDate;
    
    @Column(name = "STATUS", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "AUDIT_TYPE", columnDefinition = "NVARCHAR(255)")
    private String auditType;

    @Column(name = "ITEM_CODE", columnDefinition = "NVARCHAR(255)")
    private String itemCode;

    @Column(name = "AUDIT_AREA", columnDefinition = "NVARCHAR(255)")
    private String auditArea;

    @Column(name = "IS_DELETED", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "CRITERIA_MIN_COUNT")
    private Integer criteriaMinCount;

    @Column(name = "RESCHEDULE_COUNT")
    private Integer rescheduleCount = 0;
    
    @Column(name = "AUDIT_DATE")
    @Temporal(TemporalType.DATE)
    private Date auditDate;
    
    @Column(name = "AUDIT_MONTH", columnDefinition = "NVARCHAR(50)")
    private String auditMonth;

    @Column(name = "START_TIME", columnDefinition = "NVARCHAR(50)")
    private String startTime;

    @Column(name = "END_TIME", columnDefinition = "NVARCHAR(50)")
    private String endTime;

    @Column(name = "DEPARTMENT", columnDefinition = "NVARCHAR(255)")
    private String department;
    
    @Column(name = "AUDITEE", columnDefinition = "NVARCHAR(255)")
    private String auditee;

    @Column(name = "AUDITEE_TYPE", columnDefinition = "NVARCHAR(255)")
    private String auditeeType;

    @Column(name = "AUDITEE_DETAILS", columnDefinition = "NVARCHAR(MAX)")
    private String auditeeDetails;

    @Column(name = "AUDITOR", columnDefinition = "NVARCHAR(255)")
    private String auditor;

    @Column(name = "AUDITOR_TYPE", columnDefinition = "NVARCHAR(255)")
    private String auditorType;

    @Column(name = "AUDITOR_DETAILS", columnDefinition = "NVARCHAR(MAX)")
    private String auditorDetails;

    @Column(name = "NCR_APPROVED_BY", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedBy;

    @Column(name = "NCR_APPROVED_BY_TYPE", columnDefinition = "NVARCHAR(255)")
    private String ncrApprovedByType;

    @Column(name = "NCR_APPROVED_BY_DETAILS", columnDefinition = "NVARCHAR(MAX)")
    private String ncrApprovedByDetails;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "auditSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuditScheduleCriteria> criteriaList = new ArrayList<>();

    @Transient
    private Integer totalPoint;

    public Integer getRescheduleCount() { return rescheduleCount != null ? rescheduleCount : 0; }
    public void setRescheduleCount(Integer rescheduleCount) { this.rescheduleCount = rescheduleCount; }

    public Integer getTotalPoint() {
        return criteriaList != null ? criteriaList.size() : 0;
    }

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
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
