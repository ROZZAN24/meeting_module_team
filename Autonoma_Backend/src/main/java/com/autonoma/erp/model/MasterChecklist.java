package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "QMS_MASTER_CHECKLIST")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterChecklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SEQ_NO")
    private String seqNo;

    @Column(name = "CHECKING_POINT")
    private String checkingPoint;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "CATEGORY")
    private String category; // RENEWAL or CHECK LIST

    @Column(name = "FREQUENCY")
    private String frequency;

    @Column(name = "EFFECTIVE_FROM")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date effectiveFrom;

    @Column(name = "EXPIRY_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date expiryDate;

    @Column(name = "REMINDER_DAYS")
    private Integer reminderDays;

    @Column(name = "REMINDER_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date reminderDate;

    @Column(name = "STOCK_LINK")
    private String stockLink;

    @Column(name = "PHOTO_REQUIRED")
    private String photoRequired;

    @Column(name = "VERIFICATION_REQUIRED")
    private String verificationRequired;

    @Column(name = "LAST_COMPLETED_DATE")
    @Temporal(TemporalType.DATE)
    private Date lastCompletedDate;

    @Column(name = "NEXT_DUE_DATE")
    @Temporal(TemporalType.DATE)
    private Date nextDueDate;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedDate;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "TASK_STATUS")
    private String taskStatus;

    @Column(name = "VERIFY_STATUS")
    private String verifyStatus;

    @Column(name = "VERIFIED_BY")
    private String verifiedBy;

    @Column(name = "VERIFIED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date verifiedDate;

    @Column(name = "REJ_REASON")
    private String rejReason;

    @Column(name = "ASSIGN_TO")
    private String assignTo;

    @Column(name = "ASSIGN_DATE")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date assignDate;

    @Column(name = "ITEM_CODE")
    private String itemCode;

    @Column(name = "QTY")
    private String qty;

    @Column(name = "DUAL_CHECK")
    private String dualCheck = "NO";

    @Column(name = "CARRY_FORWARD")
    private String carryForward = "NO";

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistDepartment> departments;

    // Getters and Setters (manually added for compatibility if Lombok has issues)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSeqNo() { return seqNo; }
    public void setSeqNo(String seqNo) { this.seqNo = seqNo; }
    public String getCheckingPoint() { return checkingPoint; }
    public void setCheckingPoint(String checkingPoint) { this.checkingPoint = checkingPoint; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public Date getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(Date effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public Date getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Date expiryDate) { this.expiryDate = expiryDate; }
    public Integer getReminderDays() { return reminderDays; }
    public void setReminderDays(Integer reminderDays) { this.reminderDays = reminderDays; }
    public Date getReminderDate() { return reminderDate; }
    public void setReminderDate(Date reminderDate) { this.reminderDate = reminderDate; }
    public String getStockLink() { return stockLink; }
    public void setStockLink(String stockLink) { this.stockLink = stockLink; }
    public String getPhotoRequired() { return photoRequired; }
    public void setPhotoRequired(String photoRequired) { this.photoRequired = photoRequired; }
    public String getVerificationRequired() { return verificationRequired; }
    public void setVerificationRequired(String verificationRequired) { this.verificationRequired = verificationRequired; }
    public Date getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(Date lastCompletedDate) { this.lastCompletedDate = lastCompletedDate; }
    public Date getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(Date nextDueDate) { this.nextDueDate = nextDueDate; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Date getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(Date updatedDate) { this.updatedDate = updatedDate; }
    public String getTaskStatus() { return taskStatus; }
    public void setTaskStatus(String taskStatus) { this.taskStatus = taskStatus; }
    public String getVerifyStatus() { return verifyStatus; }
    public void setVerifyStatus(String verifyStatus) { this.verifyStatus = verifyStatus; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public Date getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(Date verifiedDate) { this.verifiedDate = verifiedDate; }
    public String getRejReason() { return rejReason; }
    public void setRejReason(String rejReason) { this.rejReason = rejReason; }
    public String getAssignTo() { return assignTo; }
    public void setAssignTo(String assignTo) { this.assignTo = assignTo; }
    public Date getAssignDate() { return assignDate; }
    public void setAssignDate(Date assignDate) { this.assignDate = assignDate; }
    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }
    public String getQty() { return qty; }
    public void setQty(String qty) { this.qty = qty; }
    public String getDualCheck() { return dualCheck; }
    public void setDualCheck(String dualCheck) { this.dualCheck = dualCheck; }
    public String getCarryForward() { return carryForward; }
    public void setCarryForward(String carryForward) { this.carryForward = carryForward; }
    public List<ChecklistDepartment> getDepartments() { return departments; }
    public void setDepartments(List<ChecklistDepartment> departments) { this.departments = departments; }
}
