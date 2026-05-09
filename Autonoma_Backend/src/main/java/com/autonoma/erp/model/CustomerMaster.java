package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SM_CUSTOMER_MASTER")
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

    @Column(name = "negotiate_customer", length = 10)
    private String negotiateCustomer;

    @Column(name = "daily_dispatch_mail", length = 10)
    private String dailyDispatchMail;

    @Column(name = "file_upload", length = 500)
    private String fileUpload;

    @Column(name = "status")
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = new Date();
    }
}
