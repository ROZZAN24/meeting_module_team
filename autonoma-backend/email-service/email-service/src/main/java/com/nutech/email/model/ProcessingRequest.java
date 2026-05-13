package com.nutech.email.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "processing_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String emailMessageId;

    @Column(length = 500)
    private String emailSubject;

    private String emailFrom;
    
    @Column(columnDefinition = "TEXT")
    private String emailTo;

    @Column(columnDefinition = "TEXT")
    private String emailBodyPreview;

    private LocalDateTime emailReceivedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(columnDefinition = "LONGTEXT")
    private String combinedText;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Intent intent = Intent.UNCLASSIFIED;

    @Column(columnDefinition = "JSON")
    private String extractedPartsJson;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProcessingStatus status = ProcessingStatus.RECEIVED;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Builder.Default
    private Integer retryCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private Integer attachmentCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Intent {
        QUOTATION_REQUEST, INVOICE_REQUEST, GENERAL_INQUIRY, SPAM, UNCLASSIFIED
    }

    public enum ProcessingStatus {
        RECEIVED, OCR_IN_PROGRESS, CLASSIFYING, EXTRACTING,
        RESOLVING_PARTS, AWAITING_REVIEW, GENERATING_DOCUMENT,
        SENDING_REPLY, COMPLETED, FAILED, SKIPPED
    }
}
