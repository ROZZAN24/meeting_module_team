package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "qms_checklist_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterChecklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "seq_no")
    private String seqNo;

    @Column(name = "checking_point")
    private String checkingPoint;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category; // RENEWAL or CHECK LIST

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "effective_from")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date effectiveFrom;

    @Column(name = "expiry_date")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date expiryDate;

    @Column(name = "reminder_days")
    private Integer reminderDays;

    @Column(name = "reminder_date")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date reminderDate;

    @Column(name = "stock_link")
    private String stockLink;

    @Column(name = "photo_required")
    private String photoRequired;

    @Column(name = "verification_required")
    private String verificationRequired;

    @Column(name = "last_completed_date")
    @Temporal(TemporalType.DATE)
    private Date lastCompletedDate;

    @Column(name = "next_due_date")
    @Temporal(TemporalType.DATE)
    private Date nextDueDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedDate;

    @Column(name = "status")
    private String status;

    @Column(name = "task_status")
    private String taskStatus;

    @Column(name = "verify_status")
    private String verifyStatus;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_date")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date verifiedDate;

    @Column(name = "rej_reason")
    private String rejReason;

    @Column(name = "assign_to")
    private String assignTo;

    @Column(name = "assign_date")
    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date assignDate;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "qty")
    private String qty;

    @Column(name = "dual_check")
    private String dualCheck = "NO";

    @Column(name = "carry_forward")
    private String carryForward = "NO";

    @Convert(converter = com.autonoma.erp.util.StringListConverter.class)
    @Column(name = "uploaded_files", columnDefinition = "NVARCHAR(MAX)")
    private List<String> uploadedFiles;

    @Convert(converter = com.autonoma.erp.util.StringListConverter.class)
    @Column(name = "scanned_files", columnDefinition = "NVARCHAR(MAX)")
    private List<String> scannedFiles;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"checklist", "hibernateLazyInitializer", "handler"})
    private List<ChecklistDepartment> departments;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ChecklistAssignment> assignments;

    @Column(name = "level_ids")
    private String levelIds; // L1,L2...

    @Column(name = "amendment_reason", columnDefinition = "TEXT")
    private String amendmentReason;

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

    public String getLevelIds() { return levelIds; }
    public void setLevelIds(String levelIds) { this.levelIds = levelIds; }

    public String getAmendmentReason() { return amendmentReason; }
    public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }

    public List<String> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<String> uploadedFiles) { this.uploadedFiles = uploadedFiles; }

    public List<String> getScannedFiles() { return scannedFiles; }
    public void setScannedFiles(List<String> scannedFiles) { this.scannedFiles = scannedFiles; }
}
