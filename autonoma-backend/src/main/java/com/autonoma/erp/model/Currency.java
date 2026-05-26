package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sm_currency")
@Data
public class Currency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "CURRENCY_CODE", length = 10)
    private String currencyCode;

    @Column(name = "CURRENCY_NAME", length = 100)
    private String currencyName;

    @Column(name = "SYMBOL", length = 10)
    private String symbol;

    @Column(name = "STATUS")
    private String status = "Active";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdDate;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = java.time.LocalDateTime.now();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = java.time.LocalDateTime.now();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
    }
}
