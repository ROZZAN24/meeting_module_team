package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_ORG_POSITION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrgPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "POSITION_TITLE", nullable = false, length = 100)
    private String positionTitle;

    @Column(name = "DEPARTMENT_ID")
    private Long departmentId;

    @Column(name = "PARENT_POSITION_ID")
    private Long parentPositionId;

    @Column(name = "ASSIGNED_EMPLOYEE_ID")
    private Long assignedEmployeeId;

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
}
