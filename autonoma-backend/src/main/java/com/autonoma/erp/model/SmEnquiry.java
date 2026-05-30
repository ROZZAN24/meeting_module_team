package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "SLS_ENQUIRY")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmEnquiry extends BaseAuditEntity {
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

    @Column(name = "REQUIREMENTS", columnDefinition = "NVARCHAR(MAX)")
    private String requirements;

    @Column(name = "SOURCE", length = 100)
    private String source;

    @Column(name = "PRIORITY", length = 50)
    private String priority = "Medium";

    @Column(name = "OCR_DOCUMENT_PATH", length = 1000)
    private String ocrDocumentPath;

    @Column(name = "OCR_EXTRACTED_TEXT", columnDefinition = "NVARCHAR(MAX)")
    private String ocrExtractedText;

    @Column(name = "OCR_CONFIDENCE", length = 10)
    private String ocrConfidence;

    @Column(name = "STATUS", length = 50)
    private String status = "Open";

    @Column(name = "REMARKS", columnDefinition = "NVARCHAR(MAX)")
    private String remarks;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;
}
