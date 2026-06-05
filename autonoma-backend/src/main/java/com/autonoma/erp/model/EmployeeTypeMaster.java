package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_TYPE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeTypeMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TYPE_NAME", unique = true, nullable = false, length = 100)
    private String typeName;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS", length = 20)
    private String status; // ACTIVE, INACTIVE

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

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    public EmployeeTypeMaster(String name) {
        this.typeName = name;
        this.status = "ACTIVE";
    }

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = new Date();
        
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = new Date();
        
        }

    // Backward-compatible aliases for legacy service code
    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    public Date getCreatedAt() { return createdDate; }
    public void setCreatedAt(Date d) { this.createdDate = d; }
    @com.fasterxml.jackson.annotation.JsonProperty("updatedAt")
    public Date getUpdatedAt() { return updatedDate; }
    public void setUpdatedAt(Date d) { this.updatedDate = d; }

    @com.fasterxml.jackson.annotation.JsonProperty("createdUser")
    public String getCreatedUser() { return this.createdBy; }
    public void setCreatedUser(String createdUser) { this.createdBy = createdUser; }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedUser")
    public String getUpdatedUser() { return this.updatedBy; }
    public void setUpdatedUser(String updatedUser) { this.updatedBy = updatedUser; }
}
