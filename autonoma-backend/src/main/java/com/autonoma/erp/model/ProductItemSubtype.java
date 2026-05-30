package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_ITEM_SUBTYPE")
@Getter
@Setter
public class ProductItemSubtype extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "TYPE_ID", nullable = false)
    private ProductItemType type;

    @Column(name = "SUB_TYPE", nullable = false, length = 100)
    private String subType;

    @Column(name = "SUB_ITEM_PREFIX", length = 50)
    private String subItemPrefix;

    @Column(name = "IS_AUTO_GENERATE_CODE", nullable = false, length = 10)
    private String isAutoGenerateCode = "YES";

    @Column(name = "PREFIX_BASED", nullable = false, length = 20)
    private String prefixBased = "SUB ITEM";

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
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
}
