package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MST_COUNTRY")
@Data
public class CountryMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COUNTRY", length = 100, nullable = false)
    private String country;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private java.time.LocalDateTime createdDate;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private java.time.LocalDateTime updatedDate;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdDate = java.time.LocalDateTime.now();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        if (isActive == null) isActive = true;
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
