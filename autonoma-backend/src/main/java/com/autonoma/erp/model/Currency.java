package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SM_CURRENCY")
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

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = java.time.LocalDateTime.now();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedDate = java.time.LocalDateTime.now();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
        }
}
