package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "NPD_ITEM_TYPE")
@Data
@NoArgsConstructor
public class ProductItemType extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "GROUP_ID", nullable = false)
    private ProductItemGroup group;

    @Column(name = "ITEM_TYPE", nullable = false, length = 100)
    private String itemType;

    @Column(name = "GROUP_PREFIX", length = 50)
    private String groupPrefix;

    @Column(name = "ITEM_PREFIX", length = 50)
    private String itemPrefix;

    @Column(name = "IS_AUTO_GENERATE_CODE", nullable = false, length = 10)
    private String isAutoGenerateCode = "NO";

    @Column(name = "PREFIX_BASED", nullable = false, length = 20)
    private String prefixBased = "GROUP";

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Override
    @PrePersist
    protected void onCreate() {
        String currentUserId = null;
        try { currentUserId = com.autonoma.erp.util.SecurityUtils.getCurrentUserId(); } catch (Exception e) {}

        super.onCreate();
        if (status == null) status = "ACTIVE";
        if (isAutoGenerateCode == null) isAutoGenerateCode = "NO";
        if (prefixBased == null) prefixBased = "GROUP";
        }
}
