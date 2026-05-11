package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_master")
@Getter
@Setter
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

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // === Ability Section ===
    @Column(name = "is_auditor", length = 10)
    private String isAuditor = "NO";

    @Column(name = "auditor_type", length = 255)
    private String auditorType;

    @Column(name = "auditor_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String auditorFileInfo;

    @Column(name = "is_auditee", length = 10)
    private String isAuditee = "NO";

    @Column(name = "auditee_type", length = 255)
    private String auditeeType;

    @Column(name = "auditee_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String auditeeFileInfo;

    @Column(name = "is_ncr_approver", length = 10)
    private String isNcrApprover = "NO";

    @Column(name = "ncr_approver_type", length = 255)
    private String ncrApproverType;

    @Column(name = "ncr_approver_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String ncrApproverFileInfo;

    @Column(name = "is_chaired", length = 10)
    private String isChaired = "NO";

    @Column(name = "chaired_type", length = 255)
    private String chairedType;

    @Column(name = "is_host", length = 10)
    private String isHost = "NO";

    @Column(name = "host_type", length = 255)
    private String hostType;

    @Column(name = "is_participants", length = 10)
    private String isParticipants = "NO";

    @Column(name = "participants_type", length = 255)
    private String participantsType;

    @Column(name = "segment", length = 255)
    private String segment;

    @Column(name = "sub_segment", length = 255)
    private String subSegment;

    @Column(name = "is_first_aid", length = 10)
    private String isFirstAid = "NO";

    @Column(name = "first_aid_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String firstAidFileInfo;

    @Column(name = "is_fire_fighter", length = 10)
    private String isFireFighter = "NO";

    @Column(name = "fire_fighter_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String fireFighterFileInfo;

    @Column(name = "is_two_wheeler", length = 10)
    private String isTwoWheeler = "NO";

    @Column(name = "two_wheeler_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String twoWheelerFileInfo;

    @Column(name = "is_four_wheeler", length = 10)
    private String isFourWheeler = "NO";

    @Column(name = "four_wheeler_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String fourWheelerFileInfo;

    @Column(name = "is_induction_eligible", length = 10)
    private String isInductionEligible = "NO";

    @Column(name = "is_interviewer", length = 10)
    private String isInterviewer = "NO";

    @Column(name = "is_enquiry_assignee", length = 10)
    private String isEnquiryAssignee = "NO";

    @Column(name = "is_pr_assignee", length = 10)
    private String isPrAssignee = "NO";

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        // Auto-compute employeeName from first + last
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
    }
}
