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

    public EmployeeTypeMaster(String name) {
        this.typeName = name;
        this.status = "ACTIVE";
    }

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
    public Date getCreatedAt() { return createdDate; }
    public void setCreatedAt(Date d) { this.createdDate = d; }
    public Date getUpdatedAt() { return updatedDate; }
    public void setUpdatedAt(Date d) { this.updatedDate = d; }
}
