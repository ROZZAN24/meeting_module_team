package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_price_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmPriceMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "master_no", nullable = false, length = 50)
    private String masterNo;

    @Column(name = "entry_date")
    @Temporal(TemporalType.DATE)
    private Date entryDate;

    @Column(name = "customer_name", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "unit_price", length = 50)
    private String unitPrice;

    @Column(name = "quantity", length = 50)
    private String quantity;

    @Column(name = "currency", length = 10)
    private String currency = "INR";

    @Column(name = "valid_from")
    @Temporal(TemporalType.DATE)
    private Date validFrom;

    @Column(name = "valid_to")
    @Temporal(TemporalType.DATE)
    private Date validTo;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "ocr_document_path", length = 500)
    private String ocrDocumentPath;

    @Column(name = "ocr_extracted_text", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "ocr_confidence", length = 10)
    private String ocrConfidence;

    @Column(name = "status", length = 50)
    private String status = "Active";

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
