package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "HR_EMPLOYEE_KYC")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeKyc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMPLOYEE_ID", nullable = false)
    private Long employeeId;

    @Column(name = "PF_NUMBER", length = 100)
    private String pfNumber;

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

    @Column(name = "PERSONAL_ACCOUNT_NUMBER", length = 50)
    private String personalAccountNumber;

    @Column(name = "BANK_NAME", length = 100)
    private String bankName;

    @Column(name = "IFSC_CODE", length = 20)
    private String ifscCode;

    @Column(name = "PHYSICALLY_CHALLENGED", length = 10)
    private String physicallyChallenged;

    @Column(name = "PHYSICALLY_CHALLENGED_CATEGORY", length = 50)
    private String physicallyChallengedCategory;

    @Column(name = "INTERNATIONAL_WORKER", length = 10)
    private String internationalWorker;

    @Column(name = "PASSPORT_NUMBER", length = 50)
    private String passportNumber;

    @Column(name = "PASSPORT_EXPIRY_DATE")
    @Temporal(TemporalType.DATE)
    private Date passportExpiryDate;

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
