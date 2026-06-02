package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "npd_model")
@Getter
@Setter
public class ProductModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "oem_id", nullable = false)
    private ProductOem oem;

    @Column(name = "model_no", nullable = false, unique = true, length = 100)
    private String modelNo;

    @Column(name = "rotor_diameter", nullable = false)
    private Double rotorDiameter = 0.0;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        this.updatedAt = LocalDateTime.now();
        }
}
