package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_customer_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_code", unique = true, nullable = false, length = 50)
    private String customerCode;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "customer_print_name", length = 200)
    private String customerPrintName;

    @Column(name = "accounts_ledger", length = 200)
    private String accountsLedger;

    @Column(name = "group_name", length = 200)
    private String groupName;

    @Column(name = "invoice_name", length = 200)
    private String invoiceName;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(name = "segment", length = 100)
    private String segment;

    @Column(name = "sub_segment", length = 100)
    private String subSegment;

    @Column(name = "domain_name", length = 150)
    private String domainName;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "state_code", length = 20)
    private String stateCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "prime_customer", length = 10)
    private String primeCustomer;

    @Column(name = "pan_no", length = 50)
    private String panNo;

    @Column(name = "pan_file_info", length = 1000)
    private String panFileInfo;

    @Column(name = "website", length = 150)
    private String website;

    @Column(name = "register_no", length = 100)
    private String registerNo;

    @Column(name = "cin_no", length = 100)
    private String cinNo;

    @Column(name = "distance")
    private String distance;

    @Column(name = "gstin", length = 50)
    private String gstin;

    @Column(name = "vendor_code", length = 50)
    private String vendorCode;

    @Column(name = "iso_number", length = 50)
    private String isoNumber;

    @Column(name = "iso_expiry")
    private String isoExpiry;

    @Column(name = "nda_required", length = 10)
    private String ndaRequired;

    @Column(name = "dispatch_mode", length = 50)
    private String dispatchMode;

    @Column(name = "currency", length = 20)
    private String currency;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "delivery_terms", length = 100)
    private String deliveryTerms;

    @Column(name = "freight", length = 100)
    private String freight;

    @Column(name = "negotiate_customer", length = 10)
    private String negotiateCustomer;

    @Column(name = "daily_dispatch_mail", length = 10)
    private String dailyDispatchMail;

    @Column(name = "file_upload", length = 2000)
    private String fileUpload;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "ld_applicable", length = 10)
    private String ldApplicable;

    @Column(name = "status")
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

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
}
