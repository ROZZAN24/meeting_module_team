package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_quotation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmQuotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quotation_no", nullable = false, length = 50)
    private String quotationNo;

    @Column(name = "quotation_date")
    @Temporal(TemporalType.DATE)
    private Date quotationDate;

    @Column(name = "enquiry_ref", length = 50)
    private String enquiryRef;

    @Column(name = "customer_name", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity", length = 50)
    private String quantity;

    @Column(name = "unit_price", length = 50)
    private String unitPrice;

    @Column(name = "total_amount", length = 50)
    private String totalAmount;

    @Column(name = "currency", length = 10)
    private String currency = "INR";

    @Column(name = "validity_period", length = 50)
    private String validityPeriod;

    @Column(name = "delivery_terms", length = 500)
    private String deliveryTerms;

    @Column(name = "payment_terms", length = 500)
    private String paymentTerms;

    @Column(name = "ocr_document_path", length = 500)
    private String ocrDocumentPath;

    @Column(name = "ocr_extracted_text", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "ocr_confidence", length = 10)
    private String ocrConfidence;

    @Column(name = "status", length = 50)
    private String status = "Draft";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @PrePersist
    protected void onCreate() { createdDate = new Date(); }

    @PreUpdate
    protected void onUpdate() { updatedDate = new Date(); }
}
