package com.autonoma.erp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "NPD_WIND_FARM")
@Getter
@Setter
public class ProductWindFarm extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "WIND_FARM_NAME", nullable = false, unique = true, length = 100)
    private String windFarmName;

    @Column(name = "CITY", nullable = false, length = 100)
    private String city;

    @Column(name = "STATE", nullable = false, length = 100)
    private String state;

    @Column(name = "COUNTRY", nullable = false, length = 100)
    private String country;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;
}
