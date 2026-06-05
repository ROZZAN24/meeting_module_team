package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_DEPARTMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "DEPARTMENT_NO", nullable = false, length = 20)
    private String departmentNo = "";

    @Column(name = "DEPARTMENT_NAME", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "DEPARTMENT_MAIL_ID", nullable = false, length = 255)
    private String departmentMailId = "";

    @Column(name = "NDA_CERTIFICATE", length = 10)
    private String ndaCertificate = "No";

    @Column(name = "SEQUENCE_NO")
    private Integer sequenceNo = 0;

    @Column(name = "STATUS", length = 20)
    private String status = "Active";

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
