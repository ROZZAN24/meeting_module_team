package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Table(name = "npd_item_type")
@Data
@NoArgsConstructor
public class ProductItemType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private ProductItemGroup group;

    @Column(name = "item_type", nullable = false, length = 100)
    private String itemType;

    @Column(name = "group_prefix", length = 50)
    private String groupPrefix;

    @Column(name = "item_prefix", length = 50)
    private String itemPrefix;

    @Column(name = "is_auto_generate_code", nullable = false, length = 10)
    private String isAutoGenerateCode = "NO";

    @Column(name = "prefix_based", nullable = false, length = 20)
    private String prefixBased = "GROUP";

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "CREATED_BY", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.createdBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        this.updatedBy = null;

        createdAt = new Date();
        if (status == null) status = "ACTIVE";
        if (isAutoGenerateCode == null) isAutoGenerateCode = "NO";
        if (prefixBased == null) prefixBased = "GROUP";
        }

    @PreUpdate
    protected void onUpdate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}
        this.updatedBy = (currentUserId != null && !currentUserId.trim().isEmpty()) ? currentUserId : "admin";
        if (this.createdBy != null && this.createdBy.trim().isEmpty()) { this.createdBy = null; }

        updatedAt = new Date();
        }
}
