package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_MANAGER_MAPPING")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeManagerMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMP_ID", nullable = false)
    private Long empId;

    @Column(name = "HOME_MANAGER_ID")
    private Long homeManagerId;

    @Column(name = "BUSINESS_MANAGER_ID")
    private Long businessManagerId;

    @Column(name = "VERTICAL_HEAD_ID")
    private Long verticalHeadId;

    @Column(name = "HR_ID")
    private Long hrId;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "STATUS", length = 50)
    private String status = "Active";

    // Backward-compatible constructor matching previous 11 fields
    public EmployeeManagerMapping(Long id, Long empId, Long homeManagerId, Long businessManagerId,
                                  Long verticalHeadId, Long hrId, String createdBy, Date createdDate,
                                  String updatedBy, Date updatedDate, String status) {
        this.id = id;
        this.empId = empId;
        this.homeManagerId = homeManagerId;
        this.businessManagerId = businessManagerId;
        this.verticalHeadId = verticalHeadId;
        this.hrId = hrId;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.updatedBy = updatedBy;
        this.updatedDate = updatedDate;
        this.status = status;
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = new Date();
        if (status == null) status = "Active";
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = new Date();
        }

    // Backward-compatible alias methods
    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    public Date getCreatedAt() {
        return this.createdDate;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdDate = createdAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedAt")
    public Date getUpdatedAt() {
        return this.updatedDate;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedDate = updatedAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("createdUser")
    public String getCreatedUser() {
        return this.createdBy;
    }

    public void setCreatedUser(String createdUser) {
        this.createdBy = createdUser;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedUser")
    public String getUpdatedUser() {
        return this.updatedBy;
    }

    public void setUpdatedUser(String updatedUser) {
        this.updatedBy = updatedUser;
    }
}
