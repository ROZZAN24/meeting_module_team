package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "npd_item_subtype")
@Getter
@Setter
public class ProductItemSubtype {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_id", nullable = false)
    private ProductItemType type;

    @Column(name = "sub_type", nullable = false, length = 100)
    private String subType;

    @Column(name = "sub_item_prefix", length = 50)
    private String subItemPrefix;

    @Column(name = "is_auto_generate_code", nullable = false, length = 10)
    private String isAutoGenerateCode = "YES";

    @Column(name = "prefix_based", nullable = false, length = 20)
    private String prefixBased = "SUB ITEM";

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
        if (this.isAutoGenerateCode == null) {
            this.isAutoGenerateCode = "YES";
        }
        if (this.prefixBased == null) {
            this.prefixBased = "SUB ITEM";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
