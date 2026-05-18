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
    private Long id;

    @Column(name = "emp_code", unique = true, nullable = false)
    private String empCode;

    @Column(name = "old_emp_code", length = 50)
    private String oldEmpCode;

    @Column(name = "title", length = 10)
    private String title;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "father_husband_name", length = 100)
    private String fatherHusbandName;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "emp_level_id")
    private Long empLevelId;

    @Column(name = "employee_type_id")
    private Long employeeTypeId;

    @Column(name = "grade_code", length = 50)
    private String gradeCode;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "department_id")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @Column(name = "designation_id")
    private Long designationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designation_id", insertable = false, updatable = false)
    private Designation designation;

    // === Uploads ===
    @Column(name = "employee_photo_upload", columnDefinition = "NVARCHAR(MAX)")
    private String employeePhotoUpload;

    @Column(name = "employee_signature_upload", columnDefinition = "NVARCHAR(MAX)")
    private String employeeSignatureUpload;

    @Column(name = "nda_upload", columnDefinition = "NVARCHAR(MAX)")
    private String ndaUpload;

    @Column(name = "fitness_certificate_upload", columnDefinition = "NVARCHAR(MAX)")
    private String fitnessCertificateUpload;

    // === Organization ===
    @Column(name = "vertical_head", length = 200)
    private String verticalHead;

    @Column(name = "hr_manager", length = 200)
    private String hrManager;

    @Column(name = "office_mail", length = 200)
    private String officeMail;

    @Column(name = "office_mail_password", length = 200)
    private String officeMailPassword;

    @Column(name = "pf_toggle", length = 10)
    private String pfToggle = "NO";

    @Column(name = "esi_toggle", length = 10)
    private String esiToggle = "NO";

    @Column(name = "p_tax_toggle", length = 10)
    private String pTaxToggle = "NO";

    @Column(name = "bonus_toggle", length = 10)
    private String bonusToggle = "NO";

    @Column(name = "ot_toggle", length = 10)
    private String otToggle = "NO";

    @Column(name = "ot_factorial", precision = 10, scale = 2)
    private BigDecimal otFactorial;

    @Column(name = "lom_deduction", length = 10)
    private String lomDeduction = "NO";

    @Column(name = "lom_allow", precision = 10, scale = 2)
    private BigDecimal lomAllow;

    @Column(name = "lta_eligible", length = 10)
    private String ltaEligible = "NO";

    @Column(name = "pf_restriction", precision = 10, scale = 2)
    private BigDecimal pfRestriction;

    @Column(name = "permission_toggle", length = 10)
    private String permissionToggle = "NO";

    @Column(name = "permission_limit", precision = 10, scale = 2)
    private BigDecimal permissionLimit;

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(name = "refer_mode", length = 50)
    private String referMode;

    @Column(name = "reference_comments", columnDefinition = "NVARCHAR(MAX)")
    private String referenceComments;

    @Column(name = "home_manager", length = 100)
    private String homeManager;

    @Column(name = "business_manager", length = 100)
    private String businessManager;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    // === Dates & Scheduling ===
    @Column(name = "date_of_joining")
    @Temporal(TemporalType.DATE)
    private Date dateOfJoining;

    @Column(name = "probation_period")
    private String probationPeriod;

    @Column(name = "confirmation_date")
    @Temporal(TemporalType.DATE)
    private Date confirmationDate;

    @Column(name = "induction_status", length = 50)
    private String inductionStatus = "PENDING";

    @Column(name = "exit_date")
    @Temporal(TemporalType.DATE)
    private Date exitDate;

    @Column(name = "exit_reason", length = 255)
    private String exitReason;

    @Column(name = "exit_comments", columnDefinition = "NVARCHAR(MAX)")
    private String exitComments;

    @Column(name = "rejoining_date")
    @Temporal(TemporalType.DATE)
    private Date rejoiningDate;

    // === Operations & Allowances ===
    @Column(name = "grace_minutes")
    private Integer graceMinutes;

    @Column(name = "petrol_mode", length = 50)
    private String petrolMode = "NA";

    @Column(name = "petrol_allowance", precision = 10, scale = 2)
    private BigDecimal petrolAllowance;

    @Column(name = "shift", length = 50)
    private String shift;

    @Column(name = "shift_name", length = 100)
    private String shiftName;

    @Column(name = "shift_duration", length = 50)
    private String shiftDuration;

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

    @Column(name = "chaired_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String chairedFileInfo;

    @Column(name = "is_host", length = 10)
    private String isHost = "NO";

    @Column(name = "host_type", length = 255)
    private String hostType;

    @Column(name = "host_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String hostFileInfo;

    @Column(name = "is_participants", length = 10)
    private String isParticipants = "NO";

    @Column(name = "participants_type", length = 255)
    private String participantsType;

    @Column(name = "participants_file_info", columnDefinition = "NVARCHAR(MAX)")
    private String participantsFileInfo;

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

    // === System ===
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

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
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
