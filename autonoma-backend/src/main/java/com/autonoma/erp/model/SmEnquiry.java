package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SM_ENQUIRY")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmEnquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ENQUIRY_NO", nullable = false, length = 50)
    private String enquiryNo;

    @Column(name = "ENQUIRY_DATE")
    @Temporal(TemporalType.DATE)
    private Date enquiryDate;

    @Column(name = "CUSTOMER_NAME", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "CONTACT_PERSON", length = 200)
    private String contactPerson;

    @Column(name = "EMAIL", length = 200)
    private String email;

    @Column(name = "PHONE", length = 50)
    private String phone;

    @Column(name = "SUBJECT", length = 500)
    private String subject;

    @Column(name = "REQUIREMENTS", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "SOURCE", length = 100)
    private String source;

    @Column(name = "PRIORITY", length = 50)
    private String priority = "Medium";

    @Column(name = "OCR_DOCUMENT_PATH", length = 500)
    private String ocrDocumentPath;

    @Column(name = "OCR_EXTRACTED_TEXT", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "OCR_CONFIDENCE", length = 10)
    private String ocrConfidence;

    @Column(name = "STATUS", length = 50)
    private String status = "Open";

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
