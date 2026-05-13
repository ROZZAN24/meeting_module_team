package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HRM_EMP_KYC")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeKyc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "pf_number", length = 100)
    private String pfNumber;

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

    @Column(name = "personal_account_number", length = 50)
    private String personalAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "physically_challenged", length = 10)
    private String physicallyChallenged;

    @Column(name = "physically_challenged_category", length = 50)
    private String physicallyChallengedCategory;

    @Column(name = "international_worker", length = 10)
    private String internationalWorker;

    @Column(name = "passport_number", length = 50)
    private String passportNumber;

    @Column(name = "passport_expiry_date")
    @Temporal(TemporalType.DATE)
    private Date passportExpiryDate;

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
