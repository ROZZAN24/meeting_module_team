package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SM_QUOTATION")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmQuotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "QUOTATION_NO", nullable = false, length = 50)
    private String quotationNo;

    @Column(name = "QUOTATION_DATE")
    @Temporal(TemporalType.DATE)
    private Date quotationDate;

    @Column(name = "ENQUIRY_REF", length = 50)
    private String enquiryRef;

    @Column(name = "CUSTOMER_NAME", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "CONTACT_PERSON", length = 200)
    private String contactPerson;

    @Column(name = "PRODUCT_NAME", length = 200)
    private String productName;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "QUANTITY", length = 50)
    private String quantity;

    @Column(name = "UNIT_PRICE", length = 50)
    private String unitPrice;

    @Column(name = "TOTAL_AMOUNT", length = 50)
    private String totalAmount;

    @Column(name = "CURRENCY", length = 10)
    private String currency = "INR";

    @Column(name = "VALIDITY_PERIOD", length = 50)
    private String validityPeriod;

    @Column(name = "DELIVERY_TERMS", length = 500)
    private String deliveryTerms;

    @Column(name = "PAYMENT_TERMS", length = 500)
    private String paymentTerms;

    @Column(name = "OCR_DOCUMENT_PATH", length = 500)
    private String ocrDocumentPath;

    @Column(name = "OCR_EXTRACTED_TEXT", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "OCR_CONFIDENCE", length = 10)
    private String ocrConfidence;

    @Column(name = "STATUS", length = 50)
    private String status = "Draft";

    @Column(name = "REMARKS", columnDefinition = "TEXT")
    private String remarks;

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
