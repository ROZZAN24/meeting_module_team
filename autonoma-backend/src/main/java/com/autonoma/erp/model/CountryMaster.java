package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MASTER_COUNTRY")
@Data
public class CountryMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COUNTRY", length = 100)
    private String country;

    @Column(name = "STATUS", length = 20)
    private String status;

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
