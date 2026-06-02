package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_JOB_PROFILE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeJobProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "WAGES_TYPE", length = 50)
    private String wagesType;

    @Column(name = "PAYMENT_MODE", length = 50)
    private String paymentMode;

    @Column(name = "SALARY_ACCOUNT_NUMBER", length = 50)
    private String salaryAccountNumber;

    @Column(name = "ACCOUNT_NAME", length = 100)
    private String accountName;

    @Column(name = "BANK_ACCOUNT_TYPE", length = 50)
    private String bankAccountType;

    @Column(name = "PERSONAL_ACCOUNT_NUMBER", length = 50)
    private String personalAccountNumber;

    @Column(name = "BANK_NAME", length = 100)
    private String bankName;

    @Column(name = "IFSC_CODE", length = 20)
    private String ifscCode;

    @Column(name = "BRANCH_NAME", length = 100)
    private String branchName;

    // === Pay Components ===
    @Column(name = "GROSS_SALARY", precision = 18, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "NET_SALARY", precision = 18, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "BASIC_SALARY", precision = 18, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "DA", precision = 18, scale = 2)
    private BigDecimal da;

    @Column(name = "HRA", precision = 18, scale = 2)
    private BigDecimal hra;

    @Column(name = "SPECIAL_ALLOWANCE", precision = 18, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "PERFORMANCE_INCENTIVE", precision = 18, scale = 2)
    private BigDecimal performanceIncentive;

    @Column(name = "CANTEEN_DEDUCTION", precision = 18, scale = 2)
    private BigDecimal canteenDeduction;

    @Column(name = "PF_TYPE", length = 50)
    private String pfType;

    @Column(name = "PF_EMPLOYEE", precision = 18, scale = 2)
    private BigDecimal pfEmployee;

    @Column(name = "ESI_EMPLOYEE", precision = 18, scale = 2)
    private BigDecimal esiEmployee;

    @Column(name = "PROFESSIONAL_TAX_AMOUNT", precision = 18, scale = 2)
    private BigDecimal professionalTaxAmount;

    @Column(name = "PF_DOCUMENT", length = 1000)
    private String pfDocument;

    // === CTC Details ===
    @Column(name = "MONTHLY_CTC", precision = 18, scale = 2)
    private BigDecimal monthlyCtc;

    @Column(name = "BASIC_SALARY_CTC", precision = 18, scale = 2)
    private BigDecimal basicSalaryCtc;

    @Column(name = "DA_CTC", precision = 18, scale = 2)
    private BigDecimal daCtc;

    @Column(name = "SPECIAL_ALLOWANCE_CTC", precision = 18, scale = 2)
    private BigDecimal specialAllowanceCtc;

    @Column(name = "CANTEEN_ALLOWANCE", precision = 18, scale = 2)
    private BigDecimal canteenAllowance;

    @Column(name = "PERFORMANCE_INCENTIVE_CTC", precision = 18, scale = 2)
    private BigDecimal performanceIncentiveCtc;

    @Column(name = "ESI_CTC", precision = 18, scale = 2)
    private BigDecimal esiCtc;

    @Column(name = "PF_CTC", precision = 18, scale = 2)
    private BigDecimal pfCtc;

    @Column(name = "GROSS_CTC", precision = 18, scale = 2)
    private BigDecimal grossCtc;

    @Column(name = "EMPLOYER_PF", precision = 18, scale = 2)
    private BigDecimal employerPf;

    @Column(name = "EMPLOYER_ESI", precision = 18, scale = 2)
    private BigDecimal employerEsi;

    @Column(name = "UNIFORM_ALLOWANCE", precision = 18, scale = 2)
    private BigDecimal uniformAllowance;

    @Column(name = "SHOE_ALLOWANCE", precision = 18, scale = 2)
    private BigDecimal shoeAllowance;

    @Column(name = "MOBILE_ALLOWANCE_CUG", precision = 18, scale = 2)
    private BigDecimal mobileAllowanceCug;

    @Column(name = "ANNUAL_CTC", precision = 18, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "SALARY_CTC", precision = 18, scale = 2)
    private BigDecimal salaryCtc;

    @Column(name = "GRATUITY", precision = 18, scale = 2)
    private BigDecimal gratuity;

    @Column(name = "BONUS", precision = 18, scale = 2)
    private BigDecimal bonus;

    @Column(name = "SPECIAL_INCENTIVE", precision = 18, scale = 2)
    private BigDecimal specialIncentive;

    @Column(name = "PERFORMANCE_LINKED_INCENTIVE", precision = 18, scale = 2)
    private BigDecimal performanceLinkedIncentive;

    @Column(name = "HEALTH_INSURANCE", precision = 18, scale = 2)
    private BigDecimal healthInsurance;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

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
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }
 updatedDate = new Date();     }
}
