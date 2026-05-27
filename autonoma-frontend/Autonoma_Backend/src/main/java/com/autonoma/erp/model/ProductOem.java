package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "npd_oem")
@Getter
@Setter
public class ProductOem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "oem_short_name", nullable = false, unique = true, length = 100)
    private String oemShortName;

    @Column(name = "oem_prefix", length = 50)
    private String oemPrefix;

    @Column(name = "oem_description", length = Integer.MAX_VALUE)
    private String oemDescription;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "status_year", length = 100)
    private String statusYear;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
