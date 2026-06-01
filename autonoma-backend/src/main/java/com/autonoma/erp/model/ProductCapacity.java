package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_CAPACITY")
@Getter
@Setter
public class ProductCapacity extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "MODEL_ID", nullable = false)
    private ProductModel model;

    @Column(name = "UOM", nullable = false, length = 20)
    private String uom; // KW, MW

    @Column(name = "CAPACITY_VAL", nullable = false)
    private Double capacityVal;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;
}
