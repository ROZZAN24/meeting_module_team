package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "hrm_designation_master")
@Data
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized
    @Column(name = "designation_code", length = 50)
    private String designationCode;

    @Nationalized
    @Column(name = "designation_name")
    private String designationName;

    @Nationalized
    @Column(name = "sub_category_level")
    private String subCategoryLevel;

    @Nationalized
    @Column(name = "experience")
    private String experience;

    @Nationalized
    @Column(name = "appear_in_competency", length = 10)
    private String appearInCompetency;

    @Column(name = "display_sl_no")
    private Integer displaySlNo;

    @Nationalized
    @Column(name = "qualification")
    private String qualification;

    @Nationalized
    @Column(name = "job_description", columnDefinition = "NVARCHAR(MAX)")
    private String jobDescription;

    @Column(name = "org_seq_no")
    private Integer orgSeqNo;

    @Column(name = "budgeted_positions")
    private Integer budgetedPositions;

    @Nationalized
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    private java.util.Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
    private java.util.Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new java.util.Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new java.util.Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
    }

    // Manual Getters and Setters for stability
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDesignationCode() { return designationCode; }
    public void setDesignationCode(String designationCode) { this.designationCode = designationCode; }
    public String getDesignationName() { return designationName; }
    public void setDesignationName(String designationName) { this.designationName = designationName; }
    public String getSubCategoryLevel() { return subCategoryLevel; }
    public void setSubCategoryLevel(String subCategoryLevel) { this.subCategoryLevel = subCategoryLevel; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getAppearInCompetency() { return appearInCompetency; }
    public void setAppearInCompetency(String appearInCompetency) { this.appearInCompetency = appearInCompetency; }
    public Integer getDisplaySlNo() { return displaySlNo; }
    public void setDisplaySlNo(Integer displaySlNo) { this.displaySlNo = displaySlNo; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
    public Integer getOrgSeqNo() { return orgSeqNo; }
    public void setOrgSeqNo(Integer orgSeqNo) { this.orgSeqNo = orgSeqNo; }
    public Integer getBudgetedPositions() { return budgetedPositions; }
    public void setBudgetedPositions(Integer budgetedPositions) { this.budgetedPositions = budgetedPositions; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
