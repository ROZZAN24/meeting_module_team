package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "SM_SUBCONTRACTOR_MASTER")
@Data
public class SubContractorMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SUBCONTRACTOR_CODE", length = 50, unique = true)
    private String subcontractorCode;

    @Column(name = "GST_NO", length = 50)
    private String gstNo;

    @Column(name = "SUBCONTRACTOR_NAME", length = 200)
    private String subcontractorName;

    @Column(name = "LEDGER_NAME", length = 200)
    private String ledgerName;

    @Column(name = "SHORT_NAME", length = 50)
    private String shortName;

    @Column(name = "SUBCONTRACTOR_PRINT_NAME", length = 200)
    private String subcontractorPrintName;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "PINCODE", length = 20)
    private String pincode;

    @Column(name = "MOBILE_NO", length = 20)
    private String mobileNo;

    @Column(name = "CONTACT_PERSON", length = 100)
    private String contactPerson;

    @Column(name = "EMAIL_ID", length = 100)
    private String emailId;

    @Column(name = "WEBSITE", length = 100)
    private String website;

    @Column(name = "PAN_NO", length = 50)
    private String panNo;

    @Column(name = "MSME_NO", length = 50)
    private String msmeNo;

    @Column(name = "ISO_NO", length = 50)
    private String isoNo;

    @Column(name = "ISO_EXPIRY_DATE")
    private String isoExpiryDate;

    @Column(name = "APPROVED_SUBCONTRACTOR", length = 10)
    private String approvedSubcontractor;

    @Column(name = "NDA_REQUIRED", length = 10)
    private String ndaRequired;

    @Column(name = "DELIVERY_TERMS", length = 100)
    private String deliveryTerms;

    @Column(name = "TYPE_OF_SERVICE", length = 100)
    private String typeOfService;

    @Column(name = "PAYMENT_TERMS", length = 100)
    private String paymentTerms;

    @Column(name = "PRIME_SUBCONTRACTOR", length = 10)
    private String primeSubcontractor;

    @Column(name = "FREIGHT_REQUIRED", length = 10)
    private String freightRequired;

    @Column(name = "CURRENCY", length = 20)
    private String currency;

    @Column(name = "DUE_DAYS")
    private String dueDays;

    @Column(name = "IS_AUDITOR_CONSULTANT", length = 10)
    private String isAuditorConsultant;

    @Column(name = "ACCOUNT_NO", length = 50)
    private String accountNo;

    @Column(name = "ACCOUNT_NAME", length = 100)
    private String accountName;

    @Column(name = "BANK_NAME", length = 100)
    private String bankName;

    @Column(name = "BRANCH_NAME", length = 100)
    private String branchName;

    @Column(name = "IFSC_CODE", length = 50)
    private String ifscCode;

    @Column(name = "SWIFT_CODE", length = 50)
    private String swiftCode;

    @Column(name = "ACCOUNT_TYPE", length = 50)
    private String accountType;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "UPLOAD_FILES", length = 2000)
    private String uploadFiles;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
