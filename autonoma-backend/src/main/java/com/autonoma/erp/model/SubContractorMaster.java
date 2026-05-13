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

    @Column(name = "SUBCONTRACTOR_NAME", length = 200)
    private String subcontractorName;

    @Column(name = "INVOICE_NAME", length = 200)
    private String invoiceName;

    @Column(name = "SHORT_NAME", length = 50)
    private String shortName;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "PINCODE", length = 20)
    private String pincode;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "STATE", length = 100)
    private String state;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "DISPATCH_MODE", length = 50)
    private String dispatchMode;

    @Column(name = "SUBCONTRACTOR_CODE", length = 50, unique = true)
    private String subcontractorCode;

    @Column(name = "GSTIN", length = 50)
    private String gstin;

    @Column(name = "ISO_NUMBER", length = 50)
    private String isoNumber;

    @Column(name = "ISO_EXPIRY")
    private String isoExpiry;

    @Column(name = "NDA_REQUIRED", length = 10)
    private String ndaRequired;

    @Column(name = "CURRENCY", length = 20)
    private String currency;

    @Column(name = "SEGMENT", length = 100)
    private String segment;

    @Column(name = "SUB_SEGMENT", length = 100)
    private String subSegment;

    @Column(name = "PAYMENT_TERMS", length = 100)
    private String paymentTerms;

    @Column(name = "DELIVERY_TERMS", length = 100)
    private String deliveryTerms;

    @Column(name = "DOMAIN_NAME", length = 100)
    private String domainName;

    @Column(name = "STATE_CODE", length = 20)
    private String stateCode;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "DISTANCE", length = 50)
    private String distance;

    @Column(name = "NEGOTIATE_SUBCONTRACTOR", length = 10)
    private String negotiateSubcontractor;

    @Column(name = "DAILY_MAIL_REQ", length = 10)
    private String dailyMailReq;

    @Column(name = "FILE_UPLOAD", length = 2000)
    private String fileUpload;

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
