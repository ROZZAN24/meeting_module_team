package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SM_PRICE_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmPriceMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "MASTER_NO", nullable = false, length = 50)
    private String masterNo;

    @Column(name = "ENTRY_DATE")
    @Temporal(TemporalType.DATE)
    private Date entryDate;

    @Column(name = "CUSTOMER_NAME", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "PRODUCT_NAME", length = 200)
    private String productName;

    @Column(name = "UNIT_PRICE", length = 50)
    private String unitPrice;

    @Column(name = "QUANTITY", length = 50)
    private String quantity;

    @Column(name = "CURRENCY", length = 10)
    private String currency = "INR";

    @Column(name = "VALID_FROM")
    @Temporal(TemporalType.DATE)
    private Date validFrom;

    @Column(name = "VALID_TO")
    @Temporal(TemporalType.DATE)
    private Date validTo;

    @Column(name = "TERMS_AND_CONDITIONS", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "OCR_DOCUMENT_PATH", length = 500)
    private String ocrDocumentPath;

    @Column(name = "OCR_EXTRACTED_TEXT", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "OCR_CONFIDENCE", length = 10)
    private String ocrConfidence;

    @Column(name = "STATUS", length = 50)
    private String status = "Active";

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
