package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_EXPERIENCE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "COMPANY_NAME", length = 255)
    private String companyName;

    @Column(name = "LOCATION", length = 255)
    private String location;

    @Column(name = "FROM_DATE")
    @Temporal(TemporalType.DATE)
    private Date fromDate;

    @Column(name = "TO_DATE")
    @Temporal(TemporalType.DATE)
    private Date toDate;

    @Column(name = "TOTAL_EXPERIENCE_MONTHS")
    private Integer totalExperienceMonths;

    @Column(name = "DOCUMENTS", length = 500)
    private String documents;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy = "admin";

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;
 createdDate = new Date();     }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy == null || this.createdBy.trim().isEmpty()) {
            this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        }
 updatedDate = new Date();     }
}
