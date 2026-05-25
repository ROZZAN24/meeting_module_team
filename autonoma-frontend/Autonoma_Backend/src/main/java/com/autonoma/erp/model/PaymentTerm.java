package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sm_payment_terms")
@Data
public class PaymentTerm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TERM_CODE", length = 50)
    private String termCode;

    @Column(name = "TERM_NAME", length = 100)
    private String termName;

    @Column(name = "DUE_DAYS")
    private Integer dueDays;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
