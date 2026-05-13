package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "hrm_employee_job_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeJobProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "wages_type", length = 50)
    private String wagesType;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode;

    @Column(name = "salary_account_number", length = 50)
    private String salaryAccountNumber;

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(name = "bank_account_type", length = 50)
    private String bankAccountType;

    @Column(name = "personal_account_number", length = 50)
    private String personalAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    // === Pay Components ===
    @Column(name = "gross_salary", precision = 18, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "net_salary", precision = 18, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "basic_salary", precision = 18, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "da", precision = 18, scale = 2)
    private BigDecimal da;

    @Column(name = "hra", precision = 18, scale = 2)
    private BigDecimal hra;

    @Column(name = "special_allowance", precision = 18, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "performance_incentive", precision = 18, scale = 2)
    private BigDecimal performanceIncentive;

    @Column(name = "canteen_deduction", precision = 18, scale = 2)
    private BigDecimal canteenDeduction;

    @Column(name = "pf_type", length = 50)
    private String pfType;

    @Column(name = "pf_employee", precision = 18, scale = 2)
    private BigDecimal pfEmployee;

    @Column(name = "esi_employee", precision = 18, scale = 2)
    private BigDecimal esiEmployee;

    @Column(name = "professional_tax_amount", precision = 18, scale = 2)
    private BigDecimal professionalTaxAmount;

    @Column(name = "pf_document", columnDefinition = "NVARCHAR(MAX)")
    private String pfDocument;

    // === CTC Details ===
    @Column(name = "monthly_ctc", precision = 18, scale = 2)
    private BigDecimal monthlyCtc;

    @Column(name = "basic_salary_ctc", precision = 18, scale = 2)
    private BigDecimal basicSalaryCtc;

    @Column(name = "da_ctc", precision = 18, scale = 2)
    private BigDecimal daCtc;

    @Column(name = "special_allowance_ctc", precision = 18, scale = 2)
    private BigDecimal specialAllowanceCtc;

    @Column(name = "canteen_allowance", precision = 18, scale = 2)
    private BigDecimal canteenAllowance;

    @Column(name = "performance_incentive_ctc", precision = 18, scale = 2)
    private BigDecimal performanceIncentiveCtc;

    @Column(name = "esi_ctc", precision = 18, scale = 2)
    private BigDecimal esiCtc;

    @Column(name = "pf_ctc", precision = 18, scale = 2)
    private BigDecimal pfCtc;

    @Column(name = "gross_ctc", precision = 18, scale = 2)
    private BigDecimal grossCtc;

    @Column(name = "employer_pf", precision = 18, scale = 2)
    private BigDecimal employerPf;

    @Column(name = "employer_esi", precision = 18, scale = 2)
    private BigDecimal employerEsi;

    @Column(name = "uniform_allowance", precision = 18, scale = 2)
    private BigDecimal uniformAllowance;

    @Column(name = "shoe_allowance", precision = 18, scale = 2)
    private BigDecimal shoeAllowance;

    @Column(name = "mobile_allowance_cug", precision = 18, scale = 2)
    private BigDecimal mobileAllowanceCug;

    @Column(name = "annual_ctc", precision = 18, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "salary_ctc", precision = 18, scale = 2)
    private BigDecimal salaryCtc;

    @Column(name = "gratuity", precision = 18, scale = 2)
    private BigDecimal gratuity;

    @Column(name = "bonus", precision = 18, scale = 2)
    private BigDecimal bonus;

    @Column(name = "special_incentive", precision = 18, scale = 2)
    private BigDecimal specialIncentive;

    @Column(name = "performance_linked_incentive", precision = 18, scale = 2)
    private BigDecimal performanceLinkedIncentive;

    @Column(name = "health_insurance", precision = 18, scale = 2)
    private BigDecimal healthInsurance;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
