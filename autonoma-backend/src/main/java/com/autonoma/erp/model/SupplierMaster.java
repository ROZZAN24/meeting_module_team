package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "sm_supplier_master")
@Data
public class SupplierMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SUPPLIER_CODE", length = 50, unique = true)
    private String supplierCode;

    @Column(name = "GST_NO", length = 50)
    private String gstNo;

    @Column(name = "SUPPLIER_NAME", length = 200)
    private String supplierName;

    @Column(name = "LEDGER_NAME", length = 200)
    private String ledgerName;

    @Column(name = "SHORT_NAME", length = 50)
    private String shortName;

    @Column(name = "SUPPLIER_PRINT_NAME", length = 200)
    private String supplierPrintName;

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

    @Column(name = "pan_file_info", length = 1000)
    private String panFileInfo;

    @Column(name = "MSME_NO", length = 50)
    private String msmeNo;

    @Column(name = "msme_file_info", length = 1000)
    private String msmeFileInfo;

    @Column(name = "ISO_NO", length = 50)
    private String isoNo;

    @Column(name = "iso_file_info", length = 1000)
    private String isoFileInfo;

    @Column(name = "ISO_EXPIRY_DATE")
    private String isoExpiryDate;

    @Column(name = "APPROVED_SUPPLIER", length = 10)
    private String approvedSupplier;

    @Column(name = "NDA_REQUIRED", length = 10)
    private String ndaRequired;

    @Column(name = "DELIVERY_TERMS", length = 100)
    private String deliveryTerms;

    @Column(name = "TYPE_OF_SERVICE", length = 100)
    private String typeOfService;

    @Column(name = "PAYMENT_TERMS", length = 100)
    private String paymentTerms;

    @Column(name = "PRIME_SUPPLIER", length = 10)
    private String primeSupplier;

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

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (createdBy == null) createdBy = "Admin";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
        if (updatedBy == null) updatedBy = "Admin";
    }
}
