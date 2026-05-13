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

    @Column(name = "personal_account_number", length = 50)
    private String personalAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    @Column(name = "bank_micro_code", length = 50)
    private String bankMicroCode;

    @Column(name = "office_email", length = 255)
    private String officeEmail;

    @Column(name = "official_password", length = 255)
    private String officialPassword;

    @Column(name = "provident_fund", length = 10)
    private String providentFund;

    @Column(name = "esi_allowed", length = 10)
    private String esiAllowed;

    @Column(name = "professional_tax", length = 10)
    private String professionalTax;

    @Column(length = 10)
    private String bonus;

    @Column(name = "over_time_allowed", length = 10)
    private String overTimeAllowed;

    @Column(name = "over_time_factorial", length = 20)
    private String overTimeFactorial;

    @Column(name = "physically_challenged", length = 10)
    private String physicallyChallenged;

    @Column(name = "loss_of_minutes_deduct", length = 10)
    private String lossOfMinutesDeduct;

    @Column(name = "loss_of_minutes_allow", length = 10)
    private String lossOfMinutesAllow;

    @Column(name = "international_worker", length = 10)
    private String internationalWorker;

    @Column(name = "lta_eligible", length = 10)
    private String ltaEligible;

    @Column(name = "pf_restriction_to", length = 50)
    private String pfRestrictionTo;

    @Column(name = "company_contact1", length = 20)
    private String companyContact1;

    @Column(name = "company_contact2", length = 20)
    private String companyContact2;

    @Column(name = "over_time_rate_per_hour", precision = 10, scale = 2)
    private BigDecimal overTimeRatePerHour;

    @Column(name = "number_of_leave_allow")
    private Integer numberOfLeaveAllow;

    @Column(name = "asset_id1", length = 50)
    private String assetId1;

    @Column(name = "ip_address1", length = 50)
    private String ipAddress1;

    @Column(name = "asset_id2", length = 50)
    private String assetId2;

    @Column(name = "ip_address2", length = 50)
    private String ipAddress2;

    @Column(name = "permission_request", length = 10)
    private String permissionRequest;

    @Column(name = "permission_hours", length = 20)
    private String permissionHours;

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
