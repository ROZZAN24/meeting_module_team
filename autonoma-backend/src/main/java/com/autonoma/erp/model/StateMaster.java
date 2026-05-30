package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "MST_STATE")
@Data
public class StateMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "COUNTRY_NAME", length = 100, nullable = false)
    private String countryName;

    @Column(name = "STATE_NAME", length = 100, nullable = false)
    private String stateName;

    @Column(name = "STATE_CODE", length = 20, nullable = false)
    private String stateCode;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private java.time.LocalDateTime createdDate;

    @Column(name = "UPDATED_BY", length = 100)
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private java.time.LocalDateTime updatedDate;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdDate = java.time.LocalDateTime.now();
        if (createdBy == null || createdBy.isEmpty()) createdBy = "Admin";
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = java.time.LocalDateTime.now();
        if (updatedBy == null || updatedBy.isEmpty()) updatedBy = "Admin";
    }
}
