package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMP_CODE", unique = true, nullable = false)
    private String empCode;

    @Column(name = "OLD_EMP_CODE", length = 50)
    private String oldEmpCode;

    @Column(name = "TITLE", length = 10)
    private String title;

    @Column(name = "EMPLOYEE_NAME")
    private String employeeName;

    @Column(name = "FIRST_NAME", length = 100)
    private String firstName;

    @Column(name = "LAST_NAME", length = 100)
    private String lastName;

    @Column(name = "FATHER_HUSBAND_NAME", length = 100)
    private String fatherHusbandName;

    @Column(name = "CATEGORY_ID")
    private Long categoryId;

    @Column(name = "EMP_LEVEL_ID")
    private Long empLevelId;

    @Column(name = "EMPLOYEE_TYPE_ID")
    private Long employeeTypeId;

    @Column(name = "GRADE_CODE", length = 50)
    private String gradeCode;

    @Column(name = "UNIT_ID")
    private Long unitId;

    @Column(name = "DEPARTMENT_ID")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DEPARTMENT_ID", insertable = false, updatable = false)
    private Department department;

    @Column(name = "DESIGNATION_ID")
    private Long designationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DESIGNATION_ID", insertable = false, updatable = false)
    private Designation designation;

    // === Uploads ===
    @Column(name = "EMPLOYEE_PHOTO_UPLOAD", length = 1000)
    private String employeePhotoUpload;

    @Column(name = "EMPLOYEE_SIGNATURE_UPLOAD", length = 1000)
    private String employeeSignatureUpload;

    @Column(name = "NDA_UPLOAD", length = 1000)
    private String ndaUpload;

    @Column(name = "FITNESS_CERTIFICATE_UPLOAD", length = 1000)
    private String fitnessCertificateUpload;

    // === Organization ===
    @Column(name = "VERTICAL_HEAD", length = 200)
    private String verticalHead;

    @Column(name = "HR_MANAGER", length = 200)
    private String hrManager;

    @Column(name = "OFFICE_MAIL", length = 200)
    private String officeMail;

    @Column(name = "OFFICE_MAIL_PASSWORD", length = 200)
    private String officeMailPassword;

    @Column(name = "PF_TOGGLE", length = 10)
    private String pfToggle = "NO";

    @Column(name = "ESI_TOGGLE", length = 10)
    private String esiToggle = "NO";

    @Column(name = "P_TAX_TOGGLE", length = 10)
    private String pTaxToggle = "NO";

    @Column(name = "BONUS_TOGGLE", length = 10)
    private String bonusToggle = "NO";

    @Column(name = "OT_TOGGLE", length = 10)
    private String otToggle = "NO";

    @Column(name = "OT_FACTORIAL", precision = 10, scale = 2)
    private BigDecimal otFactorial;

    @Column(name = "LOM_DEDUCTION", length = 10)
    private String lomDeduction = "NO";

    @Column(name = "LOM_ALLOW", precision = 10, scale = 2)
    private BigDecimal lomAllow;

    @Column(name = "LTA_ELIGIBLE", length = 10)
    private String ltaEligible = "NO";

    @Column(name = "PF_RESTRICTION", precision = 10, scale = 2)
    private BigDecimal pfRestriction;

    @Column(name = "PERMISSION_TOGGLE", length = 10)
    private String permissionToggle = "NO";

    @Column(name = "PERMISSION_LIMIT", precision = 10, scale = 2)
    private BigDecimal permissionLimit;

    @Column(name = "VENDOR_NAME", length = 200)
    private String vendorName;

    @Column(name = "REFER_MODE", length = 50)
    private String referMode;

    @Column(name = "REFERENCE_COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String referenceComments;

    @Column(name = "HOME_MANAGER", length = 100)
    private String homeManager;

    @Column(name = "BUSINESS_MANAGER", length = 100)
    private String businessManager;

    @Column(name = "SUPPLIER_NAME", length = 100)
    private String supplierName;

    // === Dates & Scheduling ===
    @Column(name = "DATE_OF_JOINING")
    @Temporal(TemporalType.DATE)
    private Date dateOfJoining;

    @Column(name = "PROBATION_PERIOD")
    private String probationPeriod;

    @Column(name = "CONFIRMATION_DATE")
    @Temporal(TemporalType.DATE)
    private Date confirmationDate;

    @Column(name = "INDUCTION_STATUS", length = 50)
    private String inductionStatus = "PENDING";

    @Column(name = "EXIT_DATE")
    @Temporal(TemporalType.DATE)
    private Date exitDate;

    @Column(name = "EXIT_REASON", length = 255)
    private String exitReason;

    @Column(name = "EXIT_COMMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String exitComments;

    @Column(name = "REJOINING_DATE")
    @Temporal(TemporalType.DATE)
    private Date rejoiningDate;

    // === Operations & Allowances ===
    @Column(name = "GRACE_MINUTES")
    private Integer graceMinutes;

    @Column(name = "PETROL_MODE", length = 50)
    private String petrolMode = "NA";

    @Column(name = "PETROL_ALLOWANCE", precision = 10, scale = 2)
    private BigDecimal petrolAllowance;

    @Column(name = "SHIFT", length = 50)
    private String shift;

    @Column(name = "SHIFT_NAME", length = 100)
    private String shiftName;

    @Column(name = "SHIFT_DURATION", length = 50)
    private String shiftDuration;

    // === Ability Section ===
    @Column(name = "IS_AUDITOR", length = 10)
    private String isAuditor = "NO";

    @Column(name = "AUDITOR_TYPE", length = 255)
    private String auditorType;

    @Column(name = "AUDITOR_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String auditorFileInfo;

    @Column(name = "IS_AUDITEE", length = 10)
    private String isAuditee = "NO";

    @Column(name = "AUDITEE_TYPE", length = 255)
    private String auditeeType;

    @Column(name = "AUDITEE_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String auditeeFileInfo;

    @Column(name = "IS_NCR_APPROVER", length = 10)
    private String isNcrApprover = "NO";

    @Column(name = "NCR_APPROVER_TYPE", length = 255)
    private String ncrApproverType;

    @Column(name = "NCR_APPROVER_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String ncrApproverFileInfo;

    @Column(name = "IS_TASK_VERIFIER", length = 10)
    private String isTaskVerifier = "NO";

    @Column(name = "TASK_VERIFIER_TYPE", length = 255)
    private String taskVerifierType;

    @Column(name = "TASK_VERIFIER_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String taskVerifierFileInfo;

    @Column(name = "IS_CHAIRED", length = 10)
    private String isChaired = "NO";

    @Column(name = "CHAIRED_TYPE", length = 255)
    private String chairedType;

    @Column(name = "CHAIRED_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String chairedFileInfo;

    @Column(name = "IS_HOST", length = 10)
    private String isHost = "NO";

    @Column(name = "HOST_TYPE", length = 255)
    private String hostType;

    @Column(name = "HOST_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String hostFileInfo;

    @Column(name = "IS_PARTICIPANTS", length = 10)
    private String isParticipants = "NO";

    @Column(name = "PARTICIPANTS_TYPE", length = 255)
    private String participantsType;

    @Column(name = "PARTICIPANTS_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String participantsFileInfo;

    @Column(name = "SEGMENT", length = 255)
    private String segment;

    @Column(name = "SUB_SEGMENT", length = 255)
    private String subSegment;

    @Column(name = "IS_FIRST_AID", length = 10)
    private String isFirstAid = "NO";

    @Column(name = "FIRST_AID_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String firstAidFileInfo;

    @Column(name = "IS_FIRE_FIGHTER", length = 10)
    private String isFireFighter = "NO";

    @Column(name = "FIRE_FIGHTER_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String fireFighterFileInfo;

    @Column(name = "IS_TWO_WHEELER", length = 10)
    private String isTwoWheeler = "NO";

    @Column(name = "TWO_WHEELER_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String twoWheelerFileInfo;

    @Column(name = "IS_FOUR_WHEELER", length = 10)
    private String isFourWheeler = "NO";

    @Column(name = "FOUR_WHEELER_FILE_INFO", columnDefinition = "NVARCHAR(MAX)")
    private String fourWheelerFileInfo;

    @Column(name = "IS_INDUCTION_ELIGIBLE", length = 10)
    private String isInductionEligible = "NO";

    @Column(name = "IS_INTERVIEWER", length = 10)
    private String isInterviewer = "NO";

    @Column(name = "IS_ENQUIRY_ASSIGNEE", length = 10)
    private String isEnquiryAssignee = "NO";

    @Column(name = "IS_PR_ASSIGNEE", length = 10)
    private String isPrAssignee = "NO";

    // === ATS Integration Fields ===
    @Column(name = "APPLICANT_DATE")
    @Temporal(TemporalType.DATE)
    private Date applicantDate;

    @Column(name = "AGE")
    private Integer age;

    @Column(name = "POSITION_LOOK_FOR", length = 100)
    private String positionLookFor;

    @Column(name = "CALL_STATUS", length = 20)
    private String callStatus = "PENDING";

    @Column(name = "INTERVIEW_STATUS", length = 20)
    private String interviewStatus = "PENDING";

    @Column(name = "OFFER_STATUS", length = 20)
    private String offerStatus = "PENDING";

    @Column(name = "VERIFICATION_STATUS", length = 20)
    private String verificationStatus = "PENDING";

    @Column(name = "Q1_NATIVE", length = 255)
    private String q1_native;

    @Column(name = "Q2_PRESENT_ADDRESS", columnDefinition = "NVARCHAR(MAX)")
    private String q2_presentAddress;

    @Column(name = "Q3_PERMANENT_ADDRESS", columnDefinition = "NVARCHAR(MAX)")
    private String q3_permanentAddress;

    @Column(name = "Q4_FATHER_OCCUPATION", length = 255)
    private String q4_fatherOccupation;

    @Column(name = "Q5_MOTHER_OCCUPATION", length = 255)
    private String q5_motherOccupation;

    @Column(name = "Q6_MARITAL_STATUS", length = 50)
    private String q6_maritalStatus;

    @Column(name = "Q7_SPOUSE_OCCUPATION", length = 255)
    private String q7_spouseOccupation;

    @Column(name = "Q8_CHILDREN", length = 255)
    private String q8_children;

    @Column(name = "Q9_HAS_RELATIVES", length = 10)
    private String q9_hasRelativesInCompany;

    @Column(name = "Q10_RELATIVES_DETAILS", columnDefinition = "NVARCHAR(MAX)")
    private String q10_relativesDetails;

    @Column(name = "Q11_SIBLINGS_OCCUPATIONS", columnDefinition = "NVARCHAR(MAX)")
    private String q11_siblingsOccupations;

    @Column(name = "Q12_HAS_TWO_WHEELER", length = 10)
    private String q12_hasTwoWheeler;

    @Column(name = "Q13_HAS_ANDROID_PHONE", length = 10)
    private String q13_hasAndroidPhone;

    @Column(name = "Q14_KNOWS_CAR_DRIVING", length = 10)
    private String q14_knowsCarDriving;

    @Column(name = "Q15_WILLING_TO_TRAVEL", length = 10)
    private String q15_willingToTravel;

    @Column(name = "Q16_COVID_VACCINATION", length = 10)
    private String q16_covidVaccination;

    @Column(name = "Q17_POSITIVE_POINTS", columnDefinition = "NVARCHAR(MAX)")
    private String q17_positivePoints;

    @Column(name = "Q18_NEGATIVE_POINTS", columnDefinition = "NVARCHAR(MAX)")
    private String q18_negativePoints;

    @Column(name = "Q19_LIFE_GOALS", columnDefinition = "NVARCHAR(MAX)")
    private String q19_lifeGoals;

    @Column(name = "Q20_IMPROVEMENT_SUGGESTIONS", columnDefinition = "NVARCHAR(MAX)")
    private String q20_improvementSuggestions;

    @Column(name = "Q21_IS_EXPERIENCED", length = 10)
    private String q21_isExperienced;

    @Column(name = "Q22_TOTAL_EXPERIENCE", length = 50)
    private String q22_totalExperience;

    @Column(name = "Q23_CORE_EXPERIENCE", length = 50)
    private String q23_coreExperience;

    @Column(name = "Q24_PREV_NET_SALARY", length = 50)
    private String q24_prevNetSalary;

    @Column(name = "Q25_PREV_GROSS_SALARY", length = 50)
    private String q25_prevGrossSalary;

    @Column(name = "Q26_EXPECTED_NET_SALARY", length = 50)
    private String q26_expectedNetSalary;

    @Column(name = "Q27_EXPECTED_GROSS_SALARY", length = 50)
    private String q27_expectedGrossSalary;

    @Column(name = "Q28_PF_HIGHER_PENSION", length = 10)
    private String q28_pfHigherPension;

    @Column(name = "Q29_PF_DEDUCTION_AMOUNT", length = 50)
    private String q29_pfDeductionAmount;

    @Column(name = "Q30_ALTERNATIVE_DEPARTMENT", length = 100)
    private String q30_alternativeDepartment;

    @Column(name = "Q31_PREV_LOCATION", length = 255)
    private String q31_prevLocation;

    @Column(name = "Q32_PREV_SHIFT", length = 50)
    private String q32_prevShift;

    @Column(name = "Q33_REASON_FOR_LEAVING", columnDefinition = "NVARCHAR(MAX)")
    private String q33_reasonForLeaving;

    @Column(name = "Q34_NOTICE_PERIOD", length = 50)
    private String q34_noticePeriod;

    @Column(name = "Q35_PREV_DEPT_POSITION", length = 255)
    private String q35_prevDeptPosition;

    @Column(name = "Q36_PREV_DEPT_COUNT", length = 50)
    private String q36_prevDeptCount;

    @Column(name = "Q37_PREV_REPORTING_TO", length = 255)
    private String q37_prevReportingTo;

    @Column(name = "Q38_HANDLE_MISTAKE", columnDefinition = "NVARCHAR(MAX)")
    private String q38_handleMistake;

    @Column(name = "Q39_HANDLE_OPINION_DIFFERENCE", columnDefinition = "NVARCHAR(MAX)")
    private String q39_handleOpinionDifference;

    @Column(name = "Q40_COMPUTER_SELF_RATING", length = 50)
    private String q40_computerSelfRating;

    @Column(name = "PAYSLIP_PATH", length = 1000)
    private String payslipPath;

    // === System ===
    @Column(name = "STATUS", length = 50)
    private String status = "Active";

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

        createdDate = new Date();
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy == null || this.createdBy.trim().isEmpty()) {
            this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        }

        updatedDate = new Date();
        if (firstName != null && lastName != null) {
            employeeName = (firstName + " " + lastName).trim();
        } else if (firstName != null) {
            employeeName = firstName;
        }
        }

    // Backward-compatible alias methods
    @com.fasterxml.jackson.annotation.JsonProperty("createdAt")
    public Date getCreatedAt() {
        return this.createdDate;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdDate = createdAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedAt")
    public Date getUpdatedAt() {
        return this.updatedDate;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedDate = updatedAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("createdUser")
    public String getCreatedUser() {
        return this.createdBy;
    }

    public void setCreatedUser(String createdUser) {
        this.createdBy = createdUser;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("updatedUser")
    public String getUpdatedUser() {
        return this.updatedBy;
    }

    public void setUpdatedUser(String updatedUser) {
        this.updatedBy = updatedUser;
    }
}
