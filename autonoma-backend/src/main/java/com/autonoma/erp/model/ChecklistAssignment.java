package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "QMS_CHECKLIST_ASSIGNMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChecklistAssignment extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHECKLIST_ID")
    @lombok.EqualsAndHashCode.Exclude
    @lombok.ToString.Exclude
    private MasterChecklist checklist;

    @Column(name = "ASSIGNED_TO")
    private String assignedTo;

    @Column(name = "ASSIGNED_BY")
    private String assignedBy;

    @Column(name = "ASSIGNED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date assignedDate;

    @ManyToOne
    @JoinColumn(name = "STATUS_ID")
    private StatusMaster status;

    @Column(name = "REMARKS", length = 2000)
    private String remarks;

    @Column(name = "CHECKLIST_DATE")
    @Temporal(TemporalType.DATE)
    private Date checklistDate;

    @Column(name = "CARRY_FORWARD")
    private String carryForward;

    @Column(name = "CARRY_FORWARD_STATUS")
    private String carryForwardStatus;

    @Column(name = "CARRY_FORWARD_COUNT")
    private Integer carryForwardCount = 0;

    @Column(name = "ASSIGN_TYPE")
    private String assignType;

    @Column(name = "VERIFIED_BY")
    private String verifiedBy;

    @Column(name = "VERIFIED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date verifiedDate;

    @Column(name = "COMMENTS", length = 2000)
    private String comments;

    @Column(name = "FILE_PATHS", length = 2000)
    private String filePaths;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MasterChecklist getChecklist() { return checklist; }
    public void setChecklist(MasterChecklist checklist) { this.checklist = checklist; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    public Date getAssignedDate() { return assignedDate; }
    public void setAssignedDate(Date assignedDate) { this.assignedDate = assignedDate; }
    public StatusMaster getStatus() { return status; }
    public void setStatus(StatusMaster status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Date getChecklistDate() { return checklistDate; }
    public void setChecklistDate(Date checklistDate) { this.checklistDate = checklistDate; }
    public String getCarryForward() { return carryForward; }
    public void setCarryForward(String carryForward) { this.carryForward = carryForward; }
    public String getCarryForwardStatus() { return carryForwardStatus; }
    public void setCarryForwardStatus(String carryForwardStatus) { this.carryForwardStatus = carryForwardStatus; }
    public Integer getCarryForwardCount() { return carryForwardCount; }
    public void setCarryForwardCount(Integer carryForwardCount) { this.carryForwardCount = carryForwardCount; }
    public String getAssignType() { return assignType; }
    public void setAssignType(String assignType) { this.assignType = assignType; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public Date getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(Date verifiedDate) { this.verifiedDate = verifiedDate; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getFilePaths() { return filePaths; }
    public void setFilePaths(String filePaths) { this.filePaths = filePaths; }

    public List<String> getActualFiles() {
        if (filePaths == null || filePaths.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return java.util.Arrays.asList(filePaths.split(","));
    }

    public void setActualFiles(List<String> files) {
        if (files == null || files.isEmpty()) {
            this.filePaths = null;
        } else {
            this.filePaths = String.join(",", files);
        }
    }
}
