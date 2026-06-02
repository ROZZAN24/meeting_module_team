package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_OEM_MAPPING")
@Getter
@Setter
public class ProductOemMapping extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PART_NO", nullable = false, unique = true, length = 100)
    private String partNo;

    @Column(name = "OEM_PART_NO", nullable = false, length = 100)
    private String oemPartNo;

    @Column(name = "OEM_DESCRIPTION", length = Integer.MAX_VALUE)
    private String oemDescription;

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
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        }
}
