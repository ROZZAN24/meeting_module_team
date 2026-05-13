package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_PERSONAL_DETAIL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePersonalDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(length = 20)
    private String gender;

    @Column(name = "birth_date")
    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(name = "marriage_date")
    @Temporal(TemporalType.DATE)
    private Date marriageDate;

    @Column(name = "number_of_children")
    private Integer numberOfChildren;

    @Column(name = "email_id", length = 255)
    private String emailId;

    @Column(length = 100)
    private String nationality;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(length = 50)
    private String religion;

    @Column(length = 20)
    private String height;

    @Column(length = 20)
    private String weight;

    @Column(name = "shirt_size", length = 20)
    private String shirtSize;

    @Column(name = "pant_size", length = 20)
    private String pantSize;

    @Column(name = "shoe_size", length = 20)
    private String shoeSize;

    @Column(name = "insurance_number", length = 100)
    private String insuranceNumber;

    @Column(name = "esic_number", length = 100)
    private String esicNumber;

    @Column(name = "pf_number", length = 100)
    private String pfNumber;

    @Column(name = "insurance_expiry_date")
    @Temporal(TemporalType.DATE)
    private Date insuranceExpiryDate;

    @Column(name = "uan_number", length = 100)
    private String uanNumber;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "aadhar_number", length = 20)
    private String aadharNumber;

    @Column(name = "driving_license_number", length = 50)
    private String drivingLicenseNumber;

    @Column(name = "license_expiry_date")
    @Temporal(TemporalType.DATE)
    private Date licenseExpiryDate;

    @Column(name = "election_card_number", length = 50)
    private String electionCardNumber;

    @Column(name = "ration_card_number", length = 50)
    private String rationCardNumber;

    @Column(name = "company_issued_mobile", length = 20)
    private String companyIssuedMobile;

    @Column(name = "mobile_deduction", precision = 10, scale = 2)
    private BigDecimal mobileDeduction;

    @Column(name = "canteen_allowance", precision = 10, scale = 2)
    private BigDecimal canteenAllowance;

    @Column(name = "loan_installment_month", length = 50)
    private String loanInstallmentMonth;

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
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
