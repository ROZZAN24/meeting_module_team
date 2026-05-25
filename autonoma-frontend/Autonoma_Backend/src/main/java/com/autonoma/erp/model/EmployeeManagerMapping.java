package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "employee_manager_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeManagerMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_id", nullable = false)
    private Long empId;

    @Column(name = "home_manager_id")
    private Long homeManagerId;

    @Column(name = "business_manager_id")
    private Long businessManagerId;

    @Column(name = "vertical_head_id")
    private Long verticalHeadId;

    @Column(name = "hr_id")
    private Long hrId;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "status", length = 50)
    private String status = "Active";

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (status == null) status = "Active";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
