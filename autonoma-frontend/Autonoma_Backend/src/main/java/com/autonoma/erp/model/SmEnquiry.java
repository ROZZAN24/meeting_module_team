package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "sm_enquiry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmEnquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enquiry_no", nullable = false, length = 50)
    private String enquiryNo;

    @Column(name = "enquiry_date")
    @Temporal(TemporalType.DATE)
    private Date enquiryDate;

    @Column(name = "customer_name", length = 200)
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private CustomerMaster customer;

    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "priority", length = 50)
    private String priority = "Medium";

    @Column(name = "ocr_document_path", length = 500)
    private String ocrDocumentPath;

    @Column(name = "ocr_extracted_text", columnDefinition = "TEXT")
    private String ocrExtractedText;

    @Column(name = "ocr_confidence", length = 10)
    private String ocrConfidence;

    @Column(name = "status", length = 50)
    private String status = "Open";

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
