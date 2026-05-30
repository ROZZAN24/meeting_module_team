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

    @Column(name = "NDA_CERTIFICATE", length = 10)
    private String ndaCertificate = "No";

    @Column(name = "SEQUENCE_NO")
    private Integer sequenceNo = 0;

    @Column(name = "STATUS", length = 20)
    private String status = "Active";

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 100)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (createdBy == null) {
            createdBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        updatedBy = com.autonoma.erp.util.SecurityUtils.getCurrentUserId();
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
