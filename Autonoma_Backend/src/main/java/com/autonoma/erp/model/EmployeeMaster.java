package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMPLOYEE_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Mandatory fields
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "emp_level_id", nullable = false)
    private Long empLevelId;

    @Column(name = "employee_type_id", nullable = false)
    private Long employeeTypeId;

    @Column(name = "title", nullable = false, length = 10)
    private String title;

    @Column(name = "employee_name", nullable = false, length = 100)
    private String employeeName;

    @Column(name = "father_husband_name", nullable = false, length = 100)
    private String fatherHusbandName;

    @Column(name = "emp_code", unique = true, nullable = false, length = 50)
    private String empCode;

    // Optional fields
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "designation_id")
    private Long designationId;

    @Column(name = "date_of_joining")
    @Temporal(TemporalType.DATE)
    private Date dateOfJoining;

    @Column(name = "confirmation_date")
    @Temporal(TemporalType.DATE)
    private Date confirmationDate;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "refer_mode")
    private String referMode;

    @Column(name = "profile_upload", length = 255)
    private String profileUpload;

    @Column(name = "signature", length = 255)
    private String signature;

    // Audit fields
    @Column(name = "status")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
