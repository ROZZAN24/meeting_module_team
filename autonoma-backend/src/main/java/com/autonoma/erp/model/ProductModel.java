package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_MODEL")
@Getter
@Setter
public class ProductModel extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "OEM_ID", nullable = false)
    private ProductOem oem;

    @Column(name = "MODEL_NO", nullable = false, unique = true, length = 100)
    private String modelNo;

    @Column(name = "ROTOR_DIAMETER", nullable = false)
    private Double rotorDiameter = 0.0;

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
    }
}
