package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_PERSONAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePersonalDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "GENDER", length = 20)
    private String gender;

    @Column(name = "BIRTH_DATE")
    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Column(name = "MARITAL_STATUS", length = 30)
    private String maritalStatus;

    @Column(name = "MARRIAGE_DATE")
    @Temporal(TemporalType.DATE)
    private Date marriageDate;

    @Column(name = "NUMBER_OF_CHILDREN")
    private Integer numberOfChildren;

    @Column(name = "PERSONAL_EMAIL", length = 255)
    private String personalEmail;

    @Column(name = "PASSPORT_NUMBER", length = 50)
    private String passportNumber;

    @Column(name = "PASSPORT_ISSUE_CITY", length = 100)
    private String passportIssueCity;

    @Column(name = "NATIONALITY", length = 100)
    private String nationality;

    @Column(name = "BLOOD_GROUP", length = 10)
    private String bloodGroup;

    @Column(name = "RELIGION", length = 50)
    private String religion;

    @Column(name = "REGION", length = 100)
    private String region;

    @Column(name = "HEIGHT", length = 20)
    private String height;

    @Column(name = "WEIGHT", length = 20)
    private String weight;

    @Column(name = "SHIRT_SIZE", length = 20)
    private String shirtSize;

    @Column(name = "PANT_SIZE", length = 20)
    private String pantSize;

    @Column(name = "SHOE_SIZE", length = 20)
    private String shoeSize;

    @Column(name = "INSURANCE_NUMBER", length = 100)
    private String insuranceNumber;

    @Column(name = "ESIC_NUMBER", length = 100)
    private String esicNumber;

    @Column(name = "PF_NUMBER", length = 100)
    private String pfNumber;

    @Column(name = "INSURANCE_EXPIRY_DATE")
    @Temporal(TemporalType.DATE)
    private Date insuranceExpiryDate;

    @Column(name = "UAN_NUMBER", length = 100)
    private String uanNumber;

    @Column(name = "PAN_NUMBER", length = 20)
    private String panNumber;

    @Column(name = "AADHAR_NUMBER", length = 20)
    private String aadharNumber;

    @Column(name = "DRIVING_LICENSE_NUMBER", length = 50)
    private String drivingLicenseNumber;

    @Column(name = "LICENSE_EXPIRY_DATE")
    @Temporal(TemporalType.DATE)
    private Date licenseExpiryDate;

    @Column(name = "ELECTION_CARD_NUMBER", length = 50)
    private String electionCardNumber;

    @Column(name = "RATION_CARD_NUMBER", length = 50)
    private String rationCardNumber;

    @Column(name = "COMPANY_ISSUED_MOBILE", length = 20)
    private String companyIssuedMobile;

    @Column(name = "MOBILE_DEDUCTION", precision = 10, scale = 2)
    private BigDecimal mobileDeduction;

    @Column(name = "CANTEEN_ALLOWANCE", precision = 10, scale = 2)
    private BigDecimal canteenAllowance;

    @Column(name = "LOAN_INSTALLMENT_MONTH", length = 50)
    private String loanInstallmentMonth;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY", length = 100)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
