package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SLS_CUSTOMER")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CUSTOMER_CODE", unique = true, nullable = false, length = 50)
    private String customerCode;

    @Column(name = "CUSTOMER_NAME", nullable = false, length = 200)
    private String customerName;

    @Column(name = "CUSTOMER_PRINT_NAME", length = 200)
    private String customerPrintName;

    @Column(name = "ACCOUNTS_LEDGER", length = 200)
    private String accountsLedger;

    @Column(name = "GROUP_NAME", length = 200)
    private String groupName;

    @Column(name = "INVOICE_NAME", length = 200)
    private String invoiceName;

    @Column(name = "SHORT_NAME", length = 50)
    private String shortName;

    @Column(name = "SEGMENT", length = 100)
    private String segment;

    @Column(name = "SUB_SEGMENT", length = 100)
    private String subSegment;

    @Column(name = "DOMAIN_NAME", length = 150)
    private String domainName;

    @Column(name = "ADDRESS", columnDefinition = "NVARCHAR(MAX)")
    private String address;

    @Column(name = "PINCODE", length = 20)
    private String pincode;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "STATE_CODE", length = 20)
    private String stateCode;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "PRIME_CUSTOMER", length = 10)
    private String primeCustomer;

    @Column(name = "PAN_NO", length = 50)
    private String panNo;

    @Column(name = "PAN_FILE_INFO", length = 1000)
    private String panFileInfo;

    @Column(name = "WEBSITE", length = 150)
    private String website;

    @Column(name = "REGISTER_NO", length = 100)
    private String registerNo;

    @Column(name = "CIN_NO", length = 100)
    private String cinNo;

    @Column(name = "DISTANCE")
    private String distance;

    @Column(name = "GSTIN", length = 50)
    private String gstin;

    @Column(name = "VENDOR_CODE", length = 50)
    private String vendorCode;

    @Column(name = "ISO_NUMBER", length = 50)
    private String isoNumber;

    @Column(name = "ISO_EXPIRY")
    private String isoExpiry;

    @Column(name = "NDA_REQUIRED", length = 10)
    private String ndaRequired;

    @Column(name = "DISPATCH_MODE", length = 50)
    private String dispatchMode;

    @Column(name = "CURRENCY", length = 20)
    private String currency;

    @Column(name = "PAYMENT_TERMS", length = 100)
    private String paymentTerms;

    @Column(name = "DELIVERY_TERMS", length = 100)
    private String deliveryTerms;

    @Column(name = "FREIGHT", length = 100)
    private String freight;

    @Column(name = "NEGOTIATE_CUSTOMER", length = 10)
    private String negotiateCustomer;

    @Column(name = "DAILY_DISPATCH_MAIL", length = 10)
    private String dailyDispatchMail;

    @Column(name = "FILE_UPLOAD", length = 1000)
    private String fileUpload;

    @Column(name = "LOCATION", length = 200)
    private String location;

    @Column(name = "LD_APPLICABLE", length = 10)
    private String ldApplicable;

    @Column(name = "STATUS")
    @Builder.Default
    private String status = "Active";

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @Column(name = "IS_ACTIVE")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
        if (createdBy == null) createdBy = "Admin";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
        if (updatedBy == null) updatedBy = "Admin";
    }

    // Backward-compatible aliases
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
