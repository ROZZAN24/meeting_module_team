package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
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

    // === Classification ===
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "sub_category_id", length = 100)
    private String subCategoryId;

    @Column(name = "emp_level_id")
    private Long empLevelId;

    @Column(name = "employee_type_id")
    private Long employeeTypeId;

    @Column(name = "grade_code", length = 50)
    private String gradeCode;

    // === Identity ===
    @Column(name = "title", length = 10)
    private String title;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "employee_name", length = 200)
    private String employeeName;

    @Column(name = "father_husband_name", length = 100)
    private String fatherHusbandName;

    @Column(name = "emp_code", unique = true, length = 50)
    private String empCode;

    @Column(name = "old_emp_code", length = 50)
    private String oldEmpCode;

    @Column(name = "guest", length = 10)
    private String guest;

    // === Organization ===
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "designation_id")
    private Long designationId;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "production_line", length = 100)
    private String productionLine;

    @Column(name = "emp_class", length = 50)
    private String empClass;

    @Column(name = "team_group", length = 100)
    private String teamGroup;

    @Column(name = "additional_role", length = 500)
    private String additionalRole;

    // === Dates ===
    @Column(name = "date_of_joining")
    @Temporal(TemporalType.DATE)
    private Date dateOfJoining;

    @Column(name = "confirmation_date")
    @Temporal(TemporalType.DATE)
    private Date confirmationDate;

    @Column(name = "next_revision_date")
    @Temporal(TemporalType.DATE)
    private Date nextRevisionDate;

    @Column(name = "exit_date")
    @Temporal(TemporalType.DATE)
    private Date exitDate;

    @Column(name = "exit_reason", length = 255)
    private String exitReason;

    // === Operations ===
    @Column(name = "daily_sheet_required", length = 10)
    private String dailySheetRequired;

    @Column(name = "attendance_required", length = 10)
    private String attendanceRequired;

    @Column(name = "induction_status", length = 50)
    private String inductionStatus;

    @Column(name = "shift", length = 10)
    private String shift;

    @Column(name = "shift_name", length = 100)
    private String shiftName;

    @Column(name = "shift_duration", length = 50)
    private String shiftDuration;

    @Column(name = "grace_minutes")
    private Integer graceMinutes;

    @Column(name = "petrol_allowance", precision = 10, scale = 2)
    private BigDecimal petrolAllowance;

    // === References ===
    @Column(name = "refer_mode", length = 50)
    private String referMode;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "home_manager", length = 100)
    private String homeManager;

    @Column(name = "business_manager", length = 100)
    private String businessManager;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    // === Uploads ===
    @Column(name = "profile_upload", length = 500)
    private String profileUpload;

    @Column(name = "signature", length = 500)
    private String signature;

    @Column(name = "nda_certificate_upload", length = 500)
    private String ndaCertificateUpload;

    @Column(name = "fitness_certificate_upload", length = 500)
    private String fitnessCertificateUpload;

    // === Audit ===
    @Column(name = "status", length = 50)
    private String status = "Active";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        // Auto-compute employeeName from first + last
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
    }
}
