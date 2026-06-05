package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "NPD_ITEM_GROUP")
@Data
@NoArgsConstructor
public class ProductItemGroup extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "GROUP_NAME", unique = true, nullable = false, length = 100)
    private String groupName;

    @Column(name = "DESCRIPTION", columnDefinition = "NVARCHAR(MAX)")
    private String description;

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
        }
}
